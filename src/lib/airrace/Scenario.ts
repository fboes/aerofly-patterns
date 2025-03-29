import {
  AeroflyMission,
  AeroflyMissionCheckpoint,
  AeroflyMissionConditions,
  AeroflyMissionConditionsCloud,
  AeroflyMissionPosition,
  AeroflyMissionTargetPlane,
} from "@fboes/aerofly-custom-missions";
import { AeroflyAircraft } from "../../data/AeroflyAircraft.js";
import { Configuration } from "./Configuration.js";
import {
  AviationWeatherApi,
  AviationWeatherNormalizedAirport,
  AviationWeatherNormalizedMetar,
} from "../general/AviationWeatherApi.js";
import { Units } from "../../data/Units.js";
import { Point, Vector } from "@fboes/geojson";
import { AeroflyMissionAutofill } from "../general/AeroflyMissionAutofill.js";

export class Scenario {
  date: Date;
  aircraft: AeroflyAircraft;
  mission: AeroflyMission;

  static async init(
    configuration: Configuration,
    aircraft: AeroflyAircraft,
    airport: AviationWeatherNormalizedAirport,
    date: Date,
    index: number = 0,
  ): Promise<Scenario> {
    const weathers = await AviationWeatherApi.fetchMetar([configuration.icaoCode], date);
    if (!weathers.length) {
      throw new Error("No METAR information from API for " + configuration.icaoCode);
    }
    const weather = new AviationWeatherNormalizedMetar(weathers[0]);

    return new Scenario(configuration, aircraft, airport, date, weather, index);
  }

  constructor(
    configuration: Configuration,
    aircraft: AeroflyAircraft,
    airport: AviationWeatherNormalizedAirport,
    date: Date,
    weather: AviationWeatherNormalizedMetar,
    index: number = 0,
  ) {
    this.date = date;
    this.aircraft = aircraft;

    if (configuration.minAltitude === 0) {
      configuration.minAltitude = airport.elev * Units.feetPerMeter + 1500;
    }
    if (configuration.maxAltitude === 0) {
      configuration.maxAltitude = airport.elev * Units.feetPerMeter + 3500;
    }

    const title = this.#getTitle(index, airport);
    const conditions = this.#makeConditions(date, weather);
    const origin = this.#makeOrigin(airport, configuration);
    const destination = origin;
    const checkpoints = this.#getCheckpoints(origin, configuration);
    const finish = this.#getFinish(checkpoints);

    this.mission = new AeroflyMission(title, {
      aircraft: {
        name: aircraft.aeroflyCode,
        icao: aircraft.icaoCode,
        livery: configuration.livery,
      },
      callsign: aircraft.callsign,
      origin,
      destination,
      flightSetting: "cruise",
      conditions,
      checkpoints,
      tags: ["airrace"],
      finish,
    });

    const describer = new AeroflyMissionAutofill(this.mission);
    this.mission.description = describer.description.replace("cruising", "racing through the sky");
    this.mission.tags = this.mission.tags.concat(describer.tags);
    this.mission.distance = describer.distance;
    this.mission.duration = describer.calculateDuration(this.aircraft.cruiseSpeedKts);
  }

  #getTitle(index: number, airport: AviationWeatherNormalizedAirport) {
    return `Air Race #${index + 1} at ${airport.name}`;
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

  #makeOrigin(airport: AviationWeatherNormalizedAirport, configuration: Configuration): AeroflyMissionPosition {
    return {
      icao: airport.icaoId,
      longitude: airport.lon,
      latitude: airport.lat,
      dir: (Math.random() * 360 + 360) % 360,
      alt: configuration.minAltitude,
    };
  }

  #getCheckpoints(origin: AeroflyMissionPosition, configuration: Configuration): AeroflyMissionCheckpoint[] {
    const numberOfLegs = this.#getRandomCheckpointCount(configuration);

    const checkpoints = [
      new AeroflyMissionCheckpoint(origin.icao, "origin", origin.longitude, origin.latitude, {
        altitude: origin.alt,
        altitudeConstraint: true,
        flyOver: true,
      }),
    ];

    let distance = 0;
    let direction = origin.dir;
    let position = new Point(origin.longitude, origin.latitude, origin.alt);

    for (let i = 0; i < numberOfLegs; i++) {
      distance = this.#getRandomLegDistance(configuration);
      direction = direction + this.#geRandomAngleChange(configuration);

      position = position.getPointBy(new Vector(distance, direction));
      position.elevation = this.#getRandomAltitude(configuration);

      checkpoints.push(
        new AeroflyMissionCheckpoint(`CP-${i + 1}`, "waypoint", position.longitude, position.latitude, {
          altitude: position.elevation ?? 0,
          altitudeConstraint: Boolean(position.elevation),
          flyOver: true,
          direction,
        }),
      );
    }

    return checkpoints;
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   */
  #getRandomCheckpointCount(configuration: Configuration) {
    if (configuration.minCheckpointCount === configuration.maxCheckpointCount) {
      return configuration.minCheckpointCount;
    }

    const minCeiled = Math.ceil(Math.min(configuration.minCheckpointCount, configuration.maxCheckpointCount));
    const maxFloored = Math.floor(Math.max(configuration.minCheckpointCount, configuration.maxCheckpointCount));
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
  }

  /**
   * in meters
   */
  #getRandomLegDistance(configuration: Configuration) {
    if (configuration.minLegDistance === configuration.maxLegDistance) {
      return configuration.minLegDistance * 1000;
    }
    return this.#getRandomArbitrary(configuration.minLegDistance, configuration.maxLegDistance) * 1000;
  }

  /**
   * in meters
   */
  #getRandomAltitude(configuration: Configuration) {
    if (configuration.minAltitude === configuration.maxAltitude) {
      return configuration.minAltitude / Units.feetPerMeter;
    }
    return this.#getRandomArbitrary(configuration.minAltitude, configuration.maxAltitude) / Units.feetPerMeter;
  }

  #geRandomAngleChange(configuration: Configuration) {
    if (configuration.minAngleChange === configuration.maxAngleChange) {
      return configuration.minAngleChange;
    }
    return this.#getRandomArbitrary(configuration.minAngleChange, configuration.maxAngleChange) * this.#getRandomSign();
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
   */
  #getRandomArbitrary(min: number, max: number) {
    return Math.random() * (Math.max(min, max) - Math.min(min, max)) + Math.min(min, max);
  }

  /**
   * @see https://stackoverflow.com/questions/44651537/correct-function-using-math-random-to-get-50-50-chance
   */
  #getRandomSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  #getFinish(checkpoints: AeroflyMissionCheckpoint[]): AeroflyMissionTargetPlane | null {
    const lastCp = checkpoints.at(-1);
    if (!lastCp) {
      return null;
    }

    return new AeroflyMissionTargetPlane(lastCp.longitude, lastCp.latitude, lastCp.direction ?? 0);
  }
}
