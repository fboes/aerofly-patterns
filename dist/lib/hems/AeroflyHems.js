// @ts-check
//import { AviationWeatherApi } from "../general/AviationWeatherApi.js";
import { Configuration } from "./Configuration.js";
import { GeoJsonLocations } from "./GeoJsonLocations.js";
import { Scenario } from "./Scenario.js";
import { DateYielder } from "../general/DateYielder.js";
import { AeroflyMissionsList } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftFinder } from "../../data/AeroflyAircraft.js";
import { AeroflyTocGenerator } from "./AeroflyTocGenerator.js";
import { AeroflyTslGenerator } from "./AeroflyTslGenerator.js";

export class AeroflyHems {
  /**
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    /**
     * @type {Configuration}
     */
    this.configuration = configuration;

    /**
     * @type {Scenario[]}
     */
    this.scenarios = [];

    /**
     * @type {GeoJsonLocations?}
     */
    this.locations = null;

    /**
     * @type {number} a tome zone which only considers the longitude, rounded to the full hour, in hours difference to UTC
     * @see https://en.wikipedia.org/wiki/Nautical_time
     */
    this.nauticalTimezone = 0;

    /**
     * @type {import('../../data/AeroflyAircraft.js').AeroflyAircraft} additional aircraft information like name and technical properties
     */
    this.aircraft = AeroflyAircraftFinder.get(this.configuration.aircraft);
    if (this.configuration.callsign) {
      this.aircraft.callsign = this.configuration.callsign;
    }
  }

  async build() {
    this.locations = new GeoJsonLocations(this.configuration.geoJsonFile);
    this.nauticalTimezone = Math.round((this.locations.heliports[0]?.geometry?.coordinates[0] ?? 0) / 15);

    const dateYielder = new DateYielder(this.configuration.numberOfMissions, this.nauticalTimezone);
    const dates = dateYielder.entries();
    let index = 0;
    for (const date of dates) {
      const scenario = new Scenario(this.locations, this.configuration, this.aircraft, date, index++);
      try {
        await scenario.build();
        this.scenarios.push(scenario);
      } catch (error) {
        console.error(error);
      }
    }

    if (this.scenarios.length === 0) {
      throw Error("No scenarios generated, possibly because of missing weather data");
    }
  }

  /**
   * @returns {string}
   */
  buildCustomMissionTmc() {
    return new AeroflyMissionsList(
      this.scenarios.map((s) => {
        return s.mission;
      }),
    ).toString();
  }

  /**
   * @returns {string}
   */
  buildEmergencySitesTsl() {
    return new AeroflyTslGenerator(this.locations?.other ?? [], this.configuration.environmentId).toString();
  }

  /**
   * @returns {string}
   */
  buildEmergencySitesToc() {
    return new AeroflyTocGenerator(this.locations?.other ?? []).toString();
  }

  buildMarkdown() {
    const scenarioMarkdown = this.scenarios
      .map((s) => {
        return `\
## ${s.mission.title}

| Departure | Duration | Flight distance |
| --------- | -------- | --------------- |
| ${s.mission.origin.icao}      | ${Math.ceil((s.mission.duration ?? 0) / 60)} min   | ${Math.ceil((s.mission.distance ?? 0) / 1000)} km           |

${s.mission.description}
`;
      })
      .join("\n");

    return `\
# Landegerät: Helicopter Emergency Medical Service Missions

This file contains ${this.configuration.numberOfMissions} Helicopter Emergency Medical Service (HEMS) missions for the ${this.aircraft.name} starting at ${this.locations?.heliports[0]?.properties?.title ?? "a random heliport"}.

- See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import [the missions into Aerofly FS 4](missions/custom_missions_user.tmc) and all other files.
- See [the Aerofly FS 4 manual on challenges / missions](https://www.aerofly.com/tutorials/missions/) on how to access these missions in Aerofly FS 4.

${scenarioMarkdown}

---

Created with [Aerofly Landegerät](https://github.com/fboes/aerofly-patterns)
`;
  }

  /**
   *
   * @returns {string} like e01045n5324
   */
  getEmergencySitesFolderSuffix() {
    const coordinates = this.locations?.heliports[0].geometry.coordinates;
    if (!coordinates) {
      return "";
    }

    return (
      (coordinates[0] > 0 ? "e" : "w") +
      String(Math.abs(Math.round(coordinates[0] * 100))).padStart(5, "0") +
      (coordinates[1] > 0 ? "n" : "s") +
      String(Math.abs(Math.round(coordinates[1] * 100))).padStart(4, "0") +
      "_"
    );
  }
}
