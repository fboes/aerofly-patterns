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
import { GeoJsonLocation } from "./GeoJsonLocations.js";
import { Vector } from "@fboes/geojson";
import { degreeDifference } from "../general/Degree.js";

export class Scenario {
  /**
   * @param {import('./GeoJsonLocations.js').GeoJsonLocations} locations
   * @param {Configuration} configuration
   * @param {import('../../data/AeroflyAircraft.js').AeroflyAircraft} aircraft
   * @param {Date} time
   * @param {number} index
   * @returns {Promise<Scenario>}
   */
  static async init(locations, configuration, aircraft, time, index = 0) {
    const missionLocations = Scenario.getMissionLocations(
      locations,
      configuration.canTransfer && locations.hospitals.length > 1 && Math.random() <= 0.1,
    );

    const metarIcaoCode = configuration.icaoCode ?? missionLocations[0].icao;
    if (metarIcaoCode === null) {
      throw new Error("No ICAO code for METAR informaton found");
    }

    const weathers = await AviationWeatherApi.fetchMetar([metarIcaoCode], time);
    if (!weathers.length) {
      throw new Error("No METAR information from API for " + metarIcaoCode);
    }
    const weather = new AviationWeatherNormalizedMetar(weathers[0]);

    return new Scenario(missionLocations, configuration, aircraft, time, weather, index);
  }

  /**
   * @param {import('./GeoJsonLocations.js').GeoJsonLocations} missionLocations
   * @param {Configuration} configuration
   * @param {import('../../data/AeroflyAircraft.js').AeroflyAircraft} aircraft
   * @param {Date} time
   * @param {AviationWeatherNormalizedMetar} weather
   * @param {number} index
   */
  constructor(missionLocations, configuration, aircraft, time, weather, index = 0) {
    /**
     * @type {Date}
     */
    this.date = time;

    /**
     * @type {import("../../data/AeroflyAircraft.js").AeroflyAircraft}
     */
    this.aircraft = aircraft;

    const mission = MissionTypeFinder.get(missionLocations[1]);

    // Building the actual mission
    const title = this.#getTitle(index, mission, missionLocations);
    const description = this.#getDescription(mission, missionLocations);
    const conditions = this.#makeConditions(time, weather);
    const origin = this.#makeMissionPosition(missionLocations[0]);
    const destination = this.#makeMissionPosition(missionLocations[missionLocations.length - 1]);
    const checkpoints = this.#getCheckpoints(missionLocations, configuration.withApproaches ? weather : null);

    this.mission = new AeroflyMission(title, {
      description,
      aircraft: {
        name: aircraft.aeroflyCode,
        icao: aircraft.icaoCode,
        livery: configuration.livery,
      },
      callsign: aircraft.callsign,
      flightSetting: configuration.isColdAndDark ? "cold_and_dark" : "takeoff",
      conditions,
      tags: ["medical", "dropoff"],
      origin,
      destination,
      checkpoints,
    });

    const describer = new AeroflyMissionAutofill(this.mission);
    this.mission.description = describer.description + "\n" + this.mission.description;
    this.mission.tags = this.mission.tags.concat(describer.tags);
    this.mission.distance = describer.distance;
    this.mission.duration = describer.calculateDuration(this.aircraft.cruiseSpeed);
    if (configuration.noGuides) {
      describer.removeGuides();
    }
  }

  #makeConditions(time, weather) {
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
        return AeroflyMissionConditionsCloud.createInFeet(c.coverOctas / 8, c.base);
      }),
    });
  }

  /**
   * @param {GeoJsonLocation[]} locations
   * @param {boolean} isTransfer
   * @returns {GeoJsonLocation[]}
   */
  static getMissionLocations(locations, isTransfer) {
    /**
     * @type {GeoJsonLocation[]}
     */
    const missionLocations = [
      locations.getRandHeliport(),
      isTransfer ? locations.getRandHospital() : locations.randomEmergencySite.next().value,
    ];
    missionLocations.push(
      isTransfer ? locations.getRandHospital(missionLocations[1]) : locations.getNearesHospital(missionLocations[1]),
    );
    const broughtPatientToOrigin = missionLocations[0] === missionLocations[2];
    if (!broughtPatientToOrigin) {
      missionLocations.push(locations.getRandHeliport());
    }
    return missionLocations;
  }

  /**
   * @param {number} index
   * @param {import("../../data/hems/MissionTypes.js").MissionType} mission
   * @param {GeoJsonLocation[]} missionLocations
   * @returns {string}
   */
  #getTitle(index, mission, missionLocations) {
    return (
      `HEMS #${index + 1}: ` +
      mission.title.replace(/\$\{(.+?)\}/g, (matches, variableName) => {
        const location = variableName === "origin" ? missionLocations[1] : missionLocations[2];
        return location.title;
      })
    );
  }

  /**
   * @param {import("../../data/hems/MissionTypes.js").MissionType} mission
   * @param {GeoJsonLocation[]} missionLocations
   * @returns {string}
   */
  #getDescription(mission, missionLocations) {
    return mission.description.replace(/\$\{(.+?)\}/g, (matches, variableName) => {
      const location = variableName === "origin" ? missionLocations[1] : missionLocations[2];
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
  }

  /**
   * @param {GeoJsonLocation[]} missionLocations
   * @param {AviationWeatherNormalizedMetar} [weather]
   * @returns {AeroflyMissionCheckpoint[]}
   */
  #getCheckpoints(missionLocations, weather = null) {
    if (weather) {
      const missionLocationsPlus = [];
      missionLocations.forEach((missionLocation, index) => {
        if (index > 0 && missionLocation.approaches.length) {
          missionLocationsPlus.push(this.#getApproachLocation(missionLocation, weather));
        }
        missionLocationsPlus.push(missionLocation);
        if (index < missionLocations.length - 1 && missionLocation.approaches.length) {
          missionLocationsPlus.push(this.#getApproachLocation(missionLocation, weather, true));
        }
      });

      missionLocations = missionLocationsPlus;
    }

    return missionLocations.map((location, index) => {
      let type = "waypoint";
      if (index === 0) {
        type = "origin";
      } else if (index === missionLocations.length - 1) {
        type = "destination";
      }
      return this.#makeCheckpoint(location, type);
    });
  }

  /**
   *
   * @param {GeoJsonLocation} missionLocation
   * @param {AviationWeatherNormalizedMetar} weather
   * @param {boolean} asDeparture
   * @returns {GeoJsonLocation}
   */
  #getApproachLocation(missionLocation, weather, asDeparture = false) {
    /**
     * @param {number} alignment
     * @returns {number}
     */
    const difference = (alignment) => {
      return Math.abs(degreeDifference((alignment + (asDeparture ? 180 : 0)) % 360, weather.wdir));
    };

    let approach = missionLocation.approaches.reduce((a, b) => {
      return difference(a) < difference(b) ? a : b;
    });

    const course = (approach + (asDeparture ? 180 : 0)) % 360;
    const vector = new Vector(1852 * (asDeparture ? 0.75 : 1.5), (approach + 180) % 360);

    return missionLocation.clone(`${String(Math.round(course / 10) % 36).padStart(2, "0")}H`, vector, 500);
  }

  /**
   *
   * @param {GeoJsonLocation} location
   * @returns {import("@fboes/aerofly-custom-missions").AeroflyMissionPosition}
   */
  #makeMissionPosition(location) {
    return {
      icao: location.icaoCode ?? location.title,
      longitude: location.coordinates.longitude,
      latitude: location.coordinates.latitude,
      alt: location.coordinates.elevation ?? 0,
      dir: location.direction ?? 0,
    };
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
        altitude: location.coordinates.elevation ?? 0,
        flyOver: !location.checkPointName.match(/\d+H$/),
      },
    );
  }
}
