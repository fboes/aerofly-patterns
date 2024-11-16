import {
  AeroflyMission,
  AeroflyMissionCheckpoint,
  AeroflyMissionConditions,
  AeroflyMissionConditionsCloud,
} from "@fboes/aerofly-custom-missions";
import { Configuration } from "./Configuration.js";
import { AviationWeatherApi, AviationWeatherNormalizedMetar } from "../general/AviationWeatherApi.js";
import AeroflyMissionDescription from "../general/AeroflyMissionDescription.js";
import { Point } from "@fboes/geojson";

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
     * @type {import('./GeoJsonLocations.js').GeoJsonFeature}
     */
    this.origin = this.#getRandLocation(locations.heliports);
    this.#checkIcao(this.origin);

    /**
     * @type {Date}
     */
    this.date = time;

    /**
     * @type {import("../../data/AeroflyAircraft.js").AeroflyAircraft}
     */
    this.aircraft = aircraft;

    const destination = this.#getRandLocation(locations.heliports);
    this.#checkIcao(destination);

    const isTransfer = this.configuration.canTransfer && locations.hospitals.length > 1 && Math.random() <= 0.1;
    const waypoint1 = this.#getRandLocation(isTransfer ? locations.hospitals : locations.other);
    const waypoint2 = isTransfer
      ? this.#getRandLocation(locations.hospitals, waypoint1)
      : this.#getNearestLocation(locations.hospitals, waypoint1);

    const conditions = new AeroflyMissionConditions({
      time,
    });

    const title =
      `HEMS #${index + 1}: ` +
      (isTransfer
        ? `Transfer from ${waypoint1.properties.title} to ${waypoint2.properties.title}`
        : waypoint1.properties.title);
    const description = isTransfer
      ? `You will need to transfer a patient from ${waypoint1.properties.title} to ${waypoint2.properties.title}.`
      : `Fly to the specified location to drop off your emergency doctor / paramedic and take a patient on board if necessary. Afterwards fly to ${waypoint2.properties.title}.`;

    this.mission = new AeroflyMission(title, {
      description,
      aircraft: {
        name: aircraft.aeroflyCode,
        icao: aircraft.icaoCode,
        livery: this.configuration.livery,
      },
      callsign: aircraft.callsign,
      flightSetting: this.configuration.isColdAndDark ? "cold_and_dark" : "taxi",
      conditions,
      tags: ["medical", "dropoff"],
      origin: {
        icao: this.origin.properties.icaoCode ?? this.origin.properties.title,
        longitude: this.origin.geometry.coordinates[0],
        latitude: this.origin.geometry.coordinates[1],
        alt: this.origin.geometry.coordinates[2] ?? 0,
        dir: this.origin.properties?.direction ?? 0,
      },
      destination: {
        icao: destination.properties.icaoCode ?? destination.properties.title,
        longitude: destination.geometry.coordinates[0],
        latitude: destination.geometry.coordinates[1],
        alt: destination.geometry.coordinates[2] ?? 0,
        dir: destination.properties?.direction ?? 0,
      },
      checkpoints: [
        this.#makeCheckpoint(this.origin, "origin"),
        this.#makeCheckpoint(waypoint1),
        this.#makeCheckpoint(waypoint2),
        this.#makeCheckpoint(destination, "destination"),
      ],
    });
  }

  async build() {
    const id = this.configuration.icaoCode ?? this.origin.properties.title;
    if (id === null) {
      return;
    }

    const weathers = await AviationWeatherApi.fetchMetar([id], this.date);
    if (!weathers.length) {
      throw new Error("No METAR information from API for " + id);
    }
    const weather = new AviationWeatherNormalizedMetar(weathers[0]);

    this.mission.conditions.wind = {
      direction: weather.wdir ?? 0,
      speed: weather.wspd,
      gusts: weather.wgst ?? 0,
    };
    this.mission.conditions.temperature = weather.temp;
    this.mission.conditions.visibility_sm = Math.min(15, weather.visib);
    this.mission.conditions.clouds = weather.clouds.map((c) => {
      return AeroflyMissionConditionsCloud.createInFeet(c.coverOctas / 8, c.base);
    });

    const describer = new AeroflyMissionDescription(this.mission);
    this.mission.description = describer.description + "\n" + this.mission.description;
    this.mission.tags = this.mission.tags.concat(describer.tags);
    this.mission.distance = describer.distance;
    this.mission.duration = describer.calculateDuration(this.aircraft.cruiseSpeed);
  }

  /**
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature[]} locations
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature?} butNot
   * @returns {import('./GeoJsonLocations.js').GeoJsonFeature}
   */
  #getRandLocation(locations, butNot = null) {
    let location = null;
    do {
      location = locations[Math.floor(Math.random() * locations.length)];
    } while (butNot && location.properties.title === butNot?.properties.title);
    return location;
  }

  /**
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature[]} locations
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature} location
   * @returns {import('./GeoJsonLocations.js').GeoJsonFeature}
   */
  #getNearestLocation(locations, location) {
    let distance = null;
    let nearestLocation = locations[0];
    for (const testLocation of locations) {
      const testDistance = this.#getDistanceBetweenLocations(testLocation, location);
      if (distance === null || testDistance < distance) {
        nearestLocation = testLocation;
        distance = testDistance;
      }
    }

    return nearestLocation;
  }

  /**
   *
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature} lastCp
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature} cp
   * @returns {number} distance in meters
   */
  #getDistanceBetweenLocations(lastCp, cp) {
    const vector = new Point(
      cp.geometry.coordinates[0],
      cp.geometry.coordinates[1],
      cp.geometry.coordinates[2] ?? null,
    ).getVectorTo(
      new Point(lastCp.geometry.coordinates[0], lastCp.geometry.coordinates[1], lastCp.geometry.coordinates[2] ?? null),
    );
    return vector.meters;
  }

  /**
   *
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature} location
   * @param {import("@fboes/aerofly-custom-missions").AeroflyMissionCheckpointType} type
   * @returns {AeroflyMissionCheckpoint}
   */
  #makeCheckpoint(location, type = "waypoint") {
    return new AeroflyMissionCheckpoint(
      this.#makeCheckpointName(location),
      type,
      location.geometry.coordinates[0],
      location.geometry.coordinates[1],
      {
        altitude: this.configuration.noGuides ? -100 : location.geometry.coordinates[2] ?? 150,
        flyOver: true,
      },
    );
  }

  /**
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature} location
   * @returns {boolean}
   */
  #checkIcao(location) {
    if (!location.properties.icaoCode.match(/^[a-zA-Z0-9]+$/)) {
      throw Error(`Not an ICAO code: ${location.properties.title}`);
    }

    return true;
  }

  /**
   *
   * @param {import('./GeoJsonLocations.js').GeoJsonFeature} location
   * @returns {string}
   */
  #makeCheckpointName(location) {
    if (location.properties.icaoCode) {
      return location.properties.icaoCode.toUpperCase();
    }
    let name = location.properties["marker-symbol"] === "hospital" ? "HOSPITAL" : "EVAC";

    return ("W-" + name).toUpperCase().replace(/[^A-Z0-9-]/, "");
  }
}
