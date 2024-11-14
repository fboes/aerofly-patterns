// @ts-check
//import { AviationWeatherApi } from "../general/AviationWeatherApi.js";
import { Configuration } from "./Configuration.js";
import { GeoJsonLocations } from "./GeoJsonLocations.js";
import { Scenario } from "./Scenario.js";
import { DateYielder } from "../general/DateYielder.js";
import { AeroflyMissionsList } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftFinder } from "../../data/AeroflyAircraft.js";

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
}
