import {
  AeroflyMission,
  AeroflyMissionCheckpoint,
  AeroflyMissionConditions,
  AeroflyMissionConditionsCloud,
} from "@fboes/aerofly-custom-missions";
import { AeroflyAircraft } from "../../data/AeroflyAircraft.js";
import {
  AviationWeatherApi,
  AviationWeatherApiMetar,
  AviationWeatherNormalizedMetar,
} from "../general/AviationWeatherApi.js";
import { Configuration } from "./Configuration.js";
import { AeroflyMissionPosition } from "@fboes/aerofly-custom-missions/types/dto/AeroflyMission.js";
import { AeroflyMissionAutofill } from "../general/AeroflyMissionAutofill.js";
import { Vector } from "@fboes/geojson";
import { Units } from "../../data/Units.js";
import { Degree } from "../general/Degree.js";
import { HoldingPattern } from "./HoldingPattern.js";
import { Rand } from "../general/Rand.js";
import { Formatter } from "../general/Formatter.js";
import { HoldingPatternFix } from "./HoldingPatternFix.js";

/**
 * Represents a scenario for a holding pattern mission in Aerofly.
 * This class encapsulates the properties and methods needed to create a holding pattern mission,
 * including the mission title, description, conditions, origin and destination positions, and checkpoints.
 */
export class Scenario {
  //date: Date;
  //aircraft: AeroflyAircraft;
  mission: AeroflyMission;
  pattern: HoldingPattern;

  static async init(
    holdingNavAid: HoldingPatternFix,
    configuration: Configuration,
    aircraft: AeroflyAircraft,
    date: Date,
    index: number = 0,
  ) {
    const getWeather = async () => {
      let weatherAttempt = 0;
      let weathers: AviationWeatherApiMetar[] = [];
      while (weatherAttempt <= 5 && !weathers.length) {
        weathers = await AviationWeatherApi.fetchMetarByPosition(holdingNavAid.position, weatherAttempt * 10000, date);
        weatherAttempt++;
      }
      if (!weathers.length) {
        throw new Error("No METAR information near " + holdingNavAid.name + " found");
      }
      const weather = new AviationWeatherNormalizedMetar(weathers[0]);
      return weather;
    };

    const weather = await getWeather();
    const self = new Scenario(configuration, aircraft, date, weather, holdingNavAid, index);
    return self;
  }

  constructor(
    private readonly configuration: Configuration,
    public readonly aircraft: AeroflyAircraft,
    private readonly date: Date,
    private readonly weather: AviationWeatherNormalizedMetar,
    public readonly holdingNavAid: HoldingPatternFix,
    public readonly index: number = 0,
  ) {
    this.pattern = new HoldingPattern(configuration, holdingNavAid, aircraft);

    // Building the actual mission
    const title = this.#getTitle(index);
    const description = this.#getDescription(this.pattern);
    const conditions = this.#makeConditions(this.date, this.weather);
    const origin = this.#makeOriginPosition(this.pattern);
    const destination = this.#makeDestinationPosition(this.pattern);
    const checkpoints = this.#getCheckpoints(this.pattern);

    this.mission = new AeroflyMission(title, {
      description,
      aircraft: {
        name: aircraft.aeroflyCode,
        icao: aircraft.icaoCode,
        livery: configuration.livery,
      },
      callsign: aircraft.callsign,
      flightSetting: "cruise",
      conditions,
      tags: ["holding"],
      origin,
      destination,
      checkpoints,
    });

    const describer = new AeroflyMissionAutofill(this.mission);
    this.mission.description = describer.description + "\n" + this.mission.description;
    this.mission.tags = this.mission.tags.concat(describer.tags);
    this.mission.distance = describer.distance;
    this.mission.duration = describer.calculateDuration(this.aircraft.cruiseSpeedKts);
    if (configuration.noGuides) {
      describer.removeGuides();
    }
  }

  #getTitle(index: number): string {
    return `HOLD #${index + 1}: ${this.holdingNavAid.name}${this.pattern.dmeDistanceNm > 0 ? ` with DME fix` : ""}`;
  }

  #getDescription(pattern: HoldingPattern): string {
    const direction = Formatter.getDirection(pattern.holdingAreaDirection);
    const radial =
      (this.holdingNavAid.type === "NDB" || this.holdingNavAid.type === "FIX" ? "inbound course " : "radial ") +
      String(Math.round(pattern.inboundHeading)).padStart(3, "0") +
      "°";
    const dmeInfo = this.#getDmeInfo(pattern);
    const turnInfo = pattern.isLeftTurn ? "make left-hand turns, " : "make right-hand turns, ";
    const altitude = new Intl.NumberFormat("en-US").format(pattern.patternAltitudeFt);

    return `Hold ${direction} of ${this.holdingNavAid.fullName} \
on the ${radial}, \
${dmeInfo}\
${turnInfo}\
maintain ${altitude}'.`;
  }

  #getDmeInfo(pattern: HoldingPattern): string {
    if (pattern.dmeDistanceNm === 0 && pattern.dmeDistanceOutboundNm === 0) {
      return "";
    }

    if (pattern.dmeDistanceOutboundNm === 0) {
      return `at ${pattern.dmeDistanceNm} NM DME, `;
    }

    if (pattern.dmeDistanceNm === 0) {
      return `outbound leg ${pattern.dmeDistanceOutboundNm} NM DME, `;
    }

    return `between ${pattern.dmeDistanceNm} NM and ${pattern.dmeDistanceOutboundNm} NM DME, `;
  }

  #makeConditions(time: Date, weather: AviationWeatherNormalizedMetar) {
    return new AeroflyMissionConditions({
      time,
      wind: {
        direction: weather.wdir ?? 0,
        speed: weather.wspd,
        gusts: weather.wgst ?? 0,
      },
      temperature: weather.temp,
      visibility_sm: Math.min(15, weather.visib),
      clouds: weather.clouds.map((c) => {
        return AeroflyMissionConditionsCloud.createInFeet(c.coverOctas / 8, c.base ?? 0);
      }),
    });
  }

  #makeOriginPosition(pattern: HoldingPattern): AeroflyMissionPosition {
    const bearing = Math.random() * 360;
    const origin = pattern.holdingFix.getPointBy(
      new Vector(this.configuration.initialDistance * Units.metersPerNauticalMile, bearing),
    );

    return {
      icao: this.weather.icaoId,
      latitude: origin.latitude,
      longitude: origin.longitude,
      alt:
        Rand.getRandomInt(this.configuration.minimumSafeAltitude, this.configuration.maximumAltitude) *
        100 *
        Units.feetPerMeter,
      dir: Degree(bearing + 180),
    };
  }

  #makeDestinationPosition(pattern: HoldingPattern): AeroflyMissionPosition {
    return {
      icao: this.weather.icaoId,
      latitude: pattern.holdingFix.latitude,
      longitude: pattern.holdingFix.longitude,
      alt: pattern.patternAltitudeFt * Units.feetPerMeter,
      dir: pattern.inboundHeading,
    };
  }

  #getCheckpoints(pattern: HoldingPattern): AeroflyMissionCheckpoint[] {
    const turnMultiplier = pattern.isLeftTurn ? -1 : 1;

    const pointAbeam = pattern.holdingFix.getPointBy(
      new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue - turnMultiplier * 90)),
    );
    const pointOutbound = pointAbeam.getPointBy(
      new Vector(pattern.legDistanceMeters, Degree(pattern.holdingAreaDirectionTrue)),
    );
    const pointInbound = pointOutbound.getPointBy(
      new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue + turnMultiplier * 90)),
    );

    const moreCheckpointProperties = {
      altitude: pattern.patternAltitudeFt / Units.feetPerMeter,
      altitudeConstraint: true,
      flyOver: true,
    };

    return [
      new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
        ...moreCheckpointProperties,
        frequency: this.holdingNavAid.frequency,
      }),
      new AeroflyMissionCheckpoint(
        pattern.id + "-ABEAM",
        "waypoint",
        pointAbeam.longitude,
        pointAbeam.latitude,
        moreCheckpointProperties,
      ),
      new AeroflyMissionCheckpoint(
        pattern.id + "-OUTBND",
        "waypoint",
        pointOutbound.longitude,
        pointOutbound.latitude,
        moreCheckpointProperties,
      ),
      new AeroflyMissionCheckpoint(
        pattern.id + "-INBND",
        "waypoint",
        pointInbound.longitude,
        pointInbound.latitude,
        moreCheckpointProperties,
      ),
      new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
        ...moreCheckpointProperties,
        frequency: this.holdingNavAid.frequency,
      }),
    ];
  }
}
