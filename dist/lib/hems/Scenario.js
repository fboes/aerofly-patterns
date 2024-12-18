import {
  AeroflyMission,
  AeroflyMissionCheckpoint,
  AeroflyMissionConditions,
  AeroflyMissionConditionsCloud,
} from "@fboes/aerofly-custom-missions";
import { Configuration } from "./Configuration.js";
import { AviationWeatherApi, AviationWeatherNormalizedMetar } from "../general/AviationWeatherApi.js";
import { AeroflyMissionAutofill } from "../general/AeroflyMissionAutofill.js";
import { MissionTypeFinder } from "../../data/hems/MissionTypes.js";

export class Scenario {
  /**
   * @param {import('./GeoJsonLocations.js').GeoJsonLocations} locations
   * @param {Configuration} configuration
   * @param {import('../../data/AeroflyAircraft.js').AeroflyAircraft} aircraft
   * @param {Date} time
   * @param {number} index
   */
  constructor(locations, configuration, aircraft, time, index = 0) {
    /**
     * @type {Configuration}
     */
    this.configuration = configuration;

    /**
     * @type {Date}
     */
    this.date = time;

    /**
     * @type {import("../../data/AeroflyAircraft.js").AeroflyAircraft}
     */
    this.aircraft = aircraft;

    /**
     * @type {import('./GeoJsonLocations.js').GeoJsonLocation}
     */
    const origin = locations.getRandHeliport();

    const isTransfer = this.configuration.canTransfer && locations.hospitals.length > 1 && Math.random() <= 0.1;
    /**
     * @type {import("./GeoJsonLocations.js").GeoJsonLocation}
     */
    const waypoint1 = isTransfer ? locations.getRandHospital() : locations.randomEmergencySite.next().value;
    /**
     * @type {import("./GeoJsonLocations.js").GeoJsonLocation}
     */
    let waypoint2 = isTransfer ? locations.getRandHospital(waypoint1) : locations.getNearesHospital(waypoint1);

    const bringPatientToOrigin = origin.isHeliportHospital && !waypoint2.isHeliportHospital;
    const destination = bringPatientToOrigin ? origin : locations.getRandHeliport();
    if (bringPatientToOrigin) {
      waypoint2 = destination;
    }
    const checkpoints = bringPatientToOrigin
      ? [
          this.#makeCheckpoint(origin, "origin"),
          this.#makeCheckpoint(waypoint1),
          this.#makeCheckpoint(destination, "destination"),
        ]
      : [
          this.#makeCheckpoint(origin, "origin"),
          this.#makeCheckpoint(waypoint1),
          this.#makeCheckpoint(waypoint2),
          this.#makeCheckpoint(destination, "destination"),
        ];

    const conditions = new AeroflyMissionConditions({
      time,
    });

    const mission = MissionTypeFinder.get(waypoint1);
    const title =
      `HEMS #${index + 1}: ` +
      mission.title.replace(/\$\{(.+?)\}/g, (matches, variableName) => {
        const location = variableName === "origin" ? waypoint1 : waypoint2;
        return location.title;
      });

    const description = mission.description.replace(/\$\{(.+?)\}/g, (matches, variableName) => {
      const location = variableName === "origin" ? waypoint1 : waypoint2;
      let description = location.title;
      if (location.icaoCode) {
        description += ` (${location.icaoCode})`;
      }

      if (location.approaches.length > 0) {
        description += ` with possible approaches ${location.approaches
          .map((a) => {
            return `${String(Math.round(a)).padStart(3, "0")}°`;
          })
          .join(" / ")}`;
      }
      return description;
    });

    this.mission = new AeroflyMission(title, {
      description,
      aircraft: {
        name: aircraft.aeroflyCode,
        icao: aircraft.icaoCode,
        livery: this.configuration.livery,
      },
      callsign: aircraft.callsign,
      flightSetting: this.configuration.isColdAndDark ? "cold_and_dark" : "takeoff",
      conditions,
      tags: ["medical", "dropoff"],
      origin: {
        icao: origin.icaoCode ?? origin.title,
        longitude: origin.coordinates.longitude,
        latitude: origin.coordinates.latitude,
        alt: origin.coordinates.elevation ?? 0,
        dir: origin.direction ?? 0,
      },
      destination: {
        icao: destination.icaoCode ?? destination.title,
        longitude: destination.coordinates.longitude,
        latitude: destination.coordinates.latitude,
        alt: destination.coordinates.elevation ?? 0,
        dir: destination.direction ?? 0,
      },
      checkpoints,
    });
  }

  /**
   * @param {import('./GeoJsonLocations.js').GeoJsonLocations} locations
   * @param {Configuration} configuration
   * @param {import('../../data/AeroflyAircraft.js').AeroflyAircraft} aircraft
   * @param {Date} time
   * @param {number} index
   * @returns {Promise<Scenario>}
   */
  static async init(locations, configuration, aircraft, time, index = 0) {
    const self = new Scenario(locations, configuration, aircraft, time, index);

    const id = self.configuration.icaoCode ?? self.mission.origin.icao;
    if (id === null) {
      return self;
    }

    const weathers = await AviationWeatherApi.fetchMetar([id], self.date);
    if (!weathers.length) {
      throw new Error("No METAR information from API for " + id);
    }
    const weather = new AviationWeatherNormalizedMetar(weathers[0]);

    self.mission.conditions.wind = {
      direction: weather.wdir ?? 0,
      speed: weather.wspd,
      gusts: weather.wgst ?? 0,
    };
    self.mission.conditions.temperature = weather.temp;
    self.mission.conditions.visibility_sm = Math.min(15, weather.visib);
    self.mission.conditions.clouds = weather.clouds.map((c) => {
      return AeroflyMissionConditionsCloud.createInFeet(c.coverOctas / 8, c.base);
    });

    const describer = new AeroflyMissionAutofill(self.mission);
    self.mission.description = describer.description + "\n" + self.mission.description;
    self.mission.tags = self.mission.tags.concat(describer.tags);
    self.mission.distance = describer.distance;
    self.mission.duration = describer.calculateDuration(self.aircraft.cruiseSpeed);
    if (self.configuration.noGuides) {
      describer.removeGuides();
    }
    return self;
  }

  /**
   *
   * @param {import('./GeoJsonLocations.js').GeoJsonLocation} location
   * @param {import("@fboes/aerofly-custom-missions").AeroflyMissionCheckpointType} type
   * @returns {AeroflyMissionCheckpoint}
   */
  #makeCheckpoint(location, type = "waypoint") {
    return new AeroflyMissionCheckpoint(
      location.checkPointName,
      type,
      location.coordinates.longitude,
      location.coordinates.latitude,
      {
        altitude: location.coordinates.elevation ?? 243.83,
        flyOver: true,
      },
    );
  }
}
