// @ts-check

import { Vector } from "@fboes/geojson";
import { Units } from "./Units.js";
import { CliOptions } from "./CliOptions.js";
import { AviationWeatherApi } from "./AviationWeatherApi.js";

/**
 * A scenario consists of the plane and its position relative to the airport,
 * the weather,
 * the active runway
 * and the entry method.
 */
export class Scenario {
  /**
   * @param {import('./Airport.js').Airport} airport
   * @param {CliOptions} cliOptions
   * @param {Date?} date
   */
  constructor(airport, cliOptions, date = null) {
    this.airport = airport;
    this.cliOptions = cliOptions;

    /**
     * @type {ScenarioAircraft}
     */
    this.aircraft = new ScenarioAircraft(airport, cliOptions.aircraft);

    /**
     * @type {ScenarioWeather?}
     */
    this.weather = null;

    /**
     * @type {Date}
     */
    this.date = date ?? new Date();

    /**
     * @type {import('./Airport.js').AirportRunway?}
     */
    this.activeRunway = null;
  }

  async build() {
    const weather = await AviationWeatherApi.fetchMetar([this.airport.id], this.date);
    this.weather = new ScenarioWeather(weather[0]);
    this.getActiveRunway();
  }

  getActiveRunway() {
    const counterWindDirection = this.weather?.windDirection ?? 0;

    /**
     * @param {number} alignment
     * @returns {number}
     */
    const difference = (alignment) => {
      const diff = Math.abs(alignment - counterWindDirection);
      return diff > 180 ? Math.abs(diff - 360) : diff;
    };

    this.activeRunway = this.airport.runways.reduce((a, b) => {
      return difference(a.alignment) < difference(b.alignment) ? a : b;
    });
  }
}

/**
 * @type  {import('./AeroflyPatterns.js').AeroflyPatternsWaypointable}
 */
class ScenarioAircraft {
  /**
   *
   * @param {import('./Airport.js').Airport} airport
   * @param {string} aircraftCode
   */
  constructor(airport, aircraftCode) {
    /**
     * @type {number} 0..360
     */
    this.bearingFromAirport = Math.random() * 360;

    /**
     * @type {number} in Nautical Miles
     */
    this.distanceFromAirport = 10;

    this.position = airport.position.getPointBy(new Vector(this.distanceFromAirport * 1852, this.bearingFromAirport));
    if (this.position.elevation !== null) {
      // Make height be 1500..3000 above airfield
      const variance = Math.min(1500, this.position.elevation / 8);
      this.position.elevation += (1500 + variance + Math.random() * (1500 - variance)) * Units.feetPerMeter;
    }
    this.id = "current";

    /**
     * @type {string} ICAO code
     */
    this.icaoCode = aircraftCode;
  }

  /**
   * @returns {string}
   */
  get aeroflyCode() {
    const aeroflyCodes = {
      BE58: "b58",
      BU33: "jungmeister",
      PTS2: "pitts",
      BE9L: "c90gtx",
    };
    return aeroflyCodes[this.icaoCode] ?? this.icaoCode.toLowerCase();
  }

  /**
   * @returns {string}
   */
  get callsign() {
    const callsigns = {
      BE58: "N58EU",
      BU33: "HBMIZ",
      PTS2: "DEUJS",
      BE9L: "DIBYP",
    };
    return callsigns[this.icaoCode] ?? "N51911";
  }
}

class ScenarioWeather {
  /**
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiMetar} weatherJson
   */
  constructor(weatherJson) {
    /**
     * @type {number} in kts
     */
    this.windDirection = weatherJson.wdir;

    /**
     * @type {number} in kts
     */
    this.windSpeed = weatherJson.wspd;

    /**
     * @type {number} in kts
     */
    this.wundGusts = weatherJson.wgst ?? 0;

    /**
     * @type {number} 0..1
     */
    this.turbulenceStrength = 0;

    /**
     * @type {number} 0..1
     */
    this.thermalStrength = 0;

    /**
     * @type {number} in Nautical Miles. Max is 15 for METAR values ending on a "+"
     */
    this.visibility = weatherJson.visib.match(/\+$/) ? 15 : Number(weatherJson.visib.replace(/\D/g, ""));

    /**
     * @type {number} 0..1
     */
    this.cloudCover = this.getCoverage(weatherJson.clouds[0]?.cover);

    /**
     * @type {number} in ft
     */
    this.cloudBase = weatherJson.clouds[0]?.base ?? 0;
  }

  /**
   *
   * @param {"CLR"|"FEW"|"SCT"|"BKN"|"OVC"?} coverCode
   * @returns {number}
   */
  getCoverage(coverCode) {
    /**
     * @type {{[key:string]:[number,number]}}
     */
    const cover = {
      CLR: [0, 1 / 16], // 0
      FEW: [1 / 16, 2 / 16], // 1/8
      SCT: [3 / 16, 3 / 16], // 2/8
      BKN: [6 / 16, 4 / 16], // 4/8
      OVC: [10 / 16, 6 / 16], // 1
    };
    const actualCover = coverCode && cover[coverCode] ? cover[coverCode] : cover.CLR;

    return actualCover[0] + Math.random() * actualCover[1];
  }
}
