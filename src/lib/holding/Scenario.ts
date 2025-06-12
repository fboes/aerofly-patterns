import { AeroflyMission, AeroflyMissionCheckpoint } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraft } from "../../data/AeroflyAircraft.js";
import { AviationWeatherNormalizedMetar } from "../general/AviationWeatherApi.js";
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
import { AviationWeatherApiHelper } from "../general/AviationWeatherApiHelper.js";

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
  ): Promise<Scenario> {
    return new Scenario(
      configuration,
      aircraft,
      date,
      await AviationWeatherApiHelper.getWeather(configuration.airportCode, date, holdingNavAid.position),
      holdingNavAid,
      index,
    );
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
    const conditions = AviationWeatherApiHelper.makeConditions(this.date, this.weather);
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
    this.mission.duration = this.pattern.furtherClearanceInMin * 60;
    if (configuration.noGuides) {
      describer.removeGuides();
    }
  }

  #getTitle(index: number): string {
    return `HOLD #${index + 1}: ${this.holdingNavAid.name}${this.pattern.dmeDistanceNm > 0 ? ` with DME fix` : ""}`;
  }

  /**
   * @see https://www.code7700.com/holding.htm
   */
  #getDescription(pattern: HoldingPattern): string {
    const direction = Formatter.getDirection(pattern.holdingAreaDirection);
    const dmeFix = pattern.dmeDistanceNm > 0 ? `the ${pattern.dmeDistanceNm} DME fix, ` : "";
    const radial =
      (this.holdingNavAid.type === "NDB" || this.holdingNavAid.type === "FIX" ? "inbound course " : "radial ") +
      String(Math.round(pattern.inboundHeading)).padStart(3, "0") +
      "°";
    const dmeInfo =
      pattern.dmeDistanceOutboundNm > 0
        ? `${Math.abs(pattern.dmeDistanceNm - pattern.dmeDistanceOutboundNm)}-mile legs, `
        : "";
    const turnInfo = pattern.isLeftTurn ? "make left-hand turns, " : "make right-hand turns, ";
    const altitude = new Intl.NumberFormat("en-US").format(pattern.patternAltitudeFt);
    const efcDate = new Date(this.date);
    efcDate.setMinutes(efcDate.getMinutes() + pattern.furtherClearanceInMin);
    const efcString = `${efcDate.getUTCHours().toString().padStart(2, "0")}:${efcDate
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}Z`;

    return `Hold ${direction} of ${dmeFix + this.holdingNavAid.fullName} \
on the ${radial}, \
${dmeInfo}\
${turnInfo}\
maintain ${altitude}'. \
Expect further clearance at ${efcString}.`;
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

    const pointAfterFix = pattern.holdingFix.getPointBy(
      new Vector(pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue + 180)),
    );
    const pointAbeam = pointAfterFix.getPointBy(
      new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue - turnMultiplier * 90)),
    );
    const pointOutbound = pointAbeam.getPointBy(
      new Vector(pattern.legDistanceMeters + 2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue)),
    );
    const pointInbound = pointOutbound.getPointBy(
      new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue + turnMultiplier * 90)),
    );

    const moreCheckpointProperties = {
      altitude: pattern.patternAltitudeFt / Units.feetPerMeter,
      altitudeConstraint: true,
    };

    return [
      new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
        ...moreCheckpointProperties,
        frequency: this.holdingNavAid.frequency,
        flyOver: true,
      }),
      new AeroflyMissionCheckpoint(
        pattern.id + "-TURN",
        "waypoint",
        pointAfterFix.longitude,
        pointAfterFix.latitude,
        moreCheckpointProperties,
      ),
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
        flyOver: true,
      }),
    ];
  }
}
