import { AeroflyMission, AeroflyMissionCheckpoint } from "@fboes/aerofly-custom-missions";
import { Configuration } from "./Configuration.js";
import { AviationWeatherNormalizedMetar } from "../general/AviationWeatherApi.js";
import { AeroflyMissionAutofill } from "../general/AeroflyMissionAutofill.js";
import { MissionType, MissionTypeFinder } from "../../data/hems/MissionTypes.js";
import { GeoJsonLocation, GeoJsonLocations } from "./GeoJsonLocations.js";
import { Vector } from "@fboes/geojson";
import { degreeDifference } from "../general/Degree.js";
import { AeroflyAircraft } from "../../data/AeroflyAircraft.js";
import { AeroflyMissionCheckpointType } from "@fboes/aerofly-custom-missions/types/dto/AeroflyMissionCheckpoint.js";
import { AeroflyMissionPosition } from "@fboes/aerofly-custom-missions/types/dto/AeroflyMission.js";
import { AviationWeatherApiHelper } from "../general/AviationWeatherApiHelper.js";

export class Scenario {
  date: Date;
  aircraft: AeroflyAircraft;
  mission: AeroflyMission;

  static async init(
    locations: GeoJsonLocations,
    configuration: Configuration,
    aircraft: AeroflyAircraft,
    time: Date,
    index: number = 0,
  ): Promise<Scenario> {
    const missionLocations = Scenario.getMissionLocations(
      locations,
      configuration.canTransfer && locations.hospitals.length > 1 && Math.random() <= 0.1,
    );
    return new Scenario(
      missionLocations,
      configuration,
      aircraft,
      time,
      await AviationWeatherApiHelper.getWeather(
        configuration.icaoCode ?? missionLocations[0].icaoCode,
        time,
        missionLocations[0].coordinates,
      ),
      index,
    );
  }

  constructor(
    missionLocations: GeoJsonLocation[],
    configuration: Configuration,
    aircraft: AeroflyAircraft,
    time: Date,
    weather: AviationWeatherNormalizedMetar,
    index: number = 0,
  ) {
    this.date = time;
    this.aircraft = aircraft;

    const mission = MissionTypeFinder.get(missionLocations[1]);

    // Building the actual mission
    const title = this.#getTitle(index, mission, missionLocations);
    const description = this.#getDescription(mission, missionLocations);
    const conditions = AviationWeatherApiHelper.makeConditions(time, weather);
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
    this.mission.duration = describer.calculateDuration(this.aircraft.cruiseSpeedKts);
    if (configuration.noGuides) {
      describer.removeGuides();
    }
  }

  static getMissionLocations(locations: GeoJsonLocations, isTransfer: boolean): GeoJsonLocation[] {
    const missionLocations: GeoJsonLocation[] = [
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
   * @param {MissionType} mission
   * @param {GeoJsonLocation[]} missionLocations
   * @returns {string}
   */
  #getTitle(index: number, mission: MissionType, missionLocations: GeoJsonLocation[]): string {
    return (
      `HEMS #${index + 1}: ` +
      mission.title.replace(/\$\{(.+?)\}/g, (matches, variableName) => {
        const location = variableName === "origin" ? missionLocations[1] : missionLocations[2];
        return location.title;
      })
    );
  }

  #getDescription(mission: MissionType, missionLocations: GeoJsonLocation[]): string {
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
  #getCheckpoints(
    missionLocations: GeoJsonLocation[],
    weather: AviationWeatherNormalizedMetar | null = null,
  ): AeroflyMissionCheckpoint[] {
    if (weather) {
      const missionLocationsPlus: GeoJsonLocation[] = [];
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
      let type: AeroflyMissionCheckpointType = "waypoint";
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
  #getApproachLocation(
    missionLocation: GeoJsonLocation,
    weather: AviationWeatherNormalizedMetar,
    asDeparture: boolean = false,
  ): GeoJsonLocation {
    /**
     * @param {number} alignment
     * @returns {number}
     */
    const difference = (alignment: number): number => {
      return Math.abs(degreeDifference((alignment + (asDeparture ? 180 : 0)) % 360, weather.wdir ?? 0));
    };

    const approach = missionLocation.approaches.reduce((a, b) => {
      return difference(a) < difference(b) ? a : b;
    });

    const course = (approach + (asDeparture ? 180 : 0)) % 360;
    const vector = new Vector(1852 * (asDeparture ? 0.75 : 1.5), (approach + 180) % 360);

    return missionLocation.clone(`${String(Math.round(course / 10) % 36).padStart(2, "0")}H`, vector, 500);
  }

  /**
   *
   * @param {GeoJsonLocation} location
   * @returns {AeroflyMissionPosition}
   */
  #makeMissionPosition(location: GeoJsonLocation): AeroflyMissionPosition {
    return {
      icao: location.icaoCode ?? location.title,
      longitude: location.coordinates.longitude,
      latitude: location.coordinates.latitude,
      alt: location.coordinates.elevation ?? 0,
      dir: location.direction ?? 0,
    };
  }

  #makeCheckpoint(
    location: GeoJsonLocation,
    type: AeroflyMissionCheckpointType = "waypoint",
  ): AeroflyMissionCheckpoint {
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
