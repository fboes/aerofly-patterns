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
import { Markdown } from "../general/Markdown.js";

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

  /**
   *
   * @param {Configuration} configuration
   * @returns {Promise<AeroflyHems>}
   */
  static async init(configuration) {
    const self = new AeroflyHems(configuration);
    self.locations = new GeoJsonLocations(self.configuration.geoJsonFile);
    self.nauticalTimezone = Math.round((self.locations.heliports[0]?.coordinates.longitude ?? 0) / 15);

    const dateYielder = new DateYielder(self.configuration.numberOfMissions, self.nauticalTimezone);
    const dates = dateYielder.entries();
    let index = 0;
    for (const date of dates) {
      try {
        const scenario = await Scenario.init(self.locations, self.configuration, self.aircraft, date, index++);
        self.scenarios.push(scenario);
      } catch (error) {
        console.error(error);
      }
    }

    if (self.scenarios.length === 0) {
      throw Error("No scenarios generated, possibly because of missing weather data");
    }

    return self;
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
        const markdownTable = Markdown.table([
          ["Departure", "Duration", "Flight distance"],
          ["---------", "--------", "---------------"],
          [
            s.mission.origin.icao,
            `${Math.ceil((s.mission.duration ?? 0) / 60)} min`,
            `${Math.ceil((s.mission.distance ?? 0) / 1000)} km`,
          ],
        ]);

        return `\
### ${s.mission.title}

${markdownTable}

${s.mission.description.replace(/\n/g, "  \n")}
`;
      })
      .join("\n");

    const featuredSitesMarkdown = this.locations?.heliportsAndHospitals
      .map((l) => {
        const title = l.url ? `[${l.title}](${l.url})` : l.title;
        return "- " + title;
      })
      .join("\n");

    return `\
# Landegerät: Helicopter Emergency Medical Service Missions

This file contains ${this.configuration.numberOfMissions} Helicopter Emergency Medical Service (HEMS) missions for the ${this.aircraft.name} starting at ${this.locations?.heliports[0]?.title ?? "a random heliport"}.

- See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import [the missions into Aerofly FS 4](missions/custom_missions_user.tmc) and all other files.
- See [the Aerofly FS 4 manual on challenges / missions](https://www.aerofly.com/tutorials/missions/) on how to access these missions in Aerofly FS 4.

## Featured sites

${featuredSitesMarkdown}

## Included missions

There are ${this.configuration.numberOfMissions} missions included in this [custom missions file](missions/custom_missions_user.tmc).

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
    const coordinates = this.locations?.heliports[0].coordinates;
    if (!coordinates) {
      return "";
    }

    return (
      (coordinates.longitude > 0 ? "e" : "w") +
      String(Math.abs(Math.round(coordinates.longitude * 100))).padStart(5, "0") +
      (coordinates.latitude > 0 ? "n" : "s") +
      String(Math.abs(Math.round(coordinates.latitude * 100))).padStart(4, "0") +
      "_"
    );
  }
}
