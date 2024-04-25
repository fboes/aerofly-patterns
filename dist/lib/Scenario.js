// @ts-check

import { Vector } from "@fboes/geojson";
import { Units } from "./Units.js";
import { CliOptions } from "./CliOptions.js";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
import { AeroflyPatternsDescription } from "./AeroflyPatterns.js";

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
    this.aircraft = new ScenarioAircraft(airport, cliOptions.aircraft, cliOptions.initialDistance);

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

    /**
     * @type {import("./AeroflyPatterns.js").AeroflyPatternsWaypointable?}
     */
    this.patternEntryPoint = null;
  }

  async build() {
    const weather = await AviationWeatherApi.fetchMetar([this.airport.id], this.date);
    if (!weather.length) {
      throw new Error("No METAR information from API");
    }
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

    this.patternEntryPoint = {
      id: this.activeRunway.id + "-ENTRY",
      position: this.airport.position.getPointBy(
        new Vector(
          Units.meterPerNauticalMile,
          this.activeRunway.alignment + ((this.activeRunway.isRightPattern ? 90 : 270) % 360),
        ),
      ),
    };
  }

  /**
   * @returns {string?}
   */
  get description() {
    if (!this.activeRunway) {
      return null;
    }

    //const distance = AeroflyPatternsDescription.getNumberString(this.aircraft.distanceFromAirport);
    const bearing = AeroflyPatternsDescription.getDirection(
      this.aircraft.bearingFromAirport - this.airport.magneticDeclination,
    );
    const towered = this.airport.hasTower ? "towered" : "untowered";
    let weatherAdjectives = this.weather ? AeroflyPatternsDescription.getWeatherAdjectives(this.weather) : "";
    if (weatherAdjectives) {
      weatherAdjectives = `a ${weatherAdjectives} `;
    }

    const runway = `${this.activeRunway.id} (${Math.round(this.activeRunway.alignment - this.airport.magneticDeclination)}°, ${Math.round(this.activeRunway.dimension[0]).toLocaleString("en")}ft)`;

    let description = `It is ${weatherAdjectives}${AeroflyPatternsDescription.getLocalDaytime(this.date, this.airport.lstOffset)}, and you are ${this.aircraft.distanceFromAirport} NM to the ${bearing} of the ${towered} airport ${this.airport.name} (${this.airport.id}). `;
    description += this.weather
      ? `As the wind is ${this.weather.windSpeed ?? 0} kts from ${this.weather.windDirection ?? 0}°, the main landing runway is ${runway}. `
      : `The main landing runway is ${runway}. `;
    description += `Fly the ${this.activeRunway.isRightPattern ? "right-turn " : ""}pattern and land safely.`;

    if (this.airport.navaids.length) {
      description +=
        "\n\nLocal NavAids: " +
        this.airport.navaids
          .map((n) => {
            return `${n.type} ${n.id}: ${n.frequency}`;
          })
          .join(" | ");
    }

    return description;
  }

  /**
   * @returns {[import("./AeroflyPatterns.js").AeroflyPatternsWaypointable, string, number?, number?][]} will return an empty array if not all preconditions are met
   */
  get waypoints() {
    if (!this.activeRunway || !this.patternEntryPoint) {
      return [];
    }
    return [
      [this.airport, "origin"],
      [this.activeRunway, "departure_runway", this.activeRunway.dimension[0] / Units.feetPerMeter],
      [this.patternEntryPoint, "waypoint"],
      [this.activeRunway, "destination_runway", this.activeRunway.dimension[0] / Units.feetPerMeter],
      [this.airport, "destination"],
    ];
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
   * @param {number} distanceFromAirport
   */
  constructor(airport, aircraftCode, distanceFromAirport) {
    /**
     * @type {number} true bearing. 0..360
     */
    this.bearingFromAirport = Math.random() * 360;

    /**
     * @type {number} in Nautical Miles
     */
    this.distanceFromAirport = distanceFromAirport;

    this.position = airport.position.getPointBy(new Vector(this.distanceFromAirport * 1852, this.bearingFromAirport));
    if (this.position.elevation !== null) {
      // Make height be 1500..3000 above airfield
      const variance = Math.min(1500, this.position.elevation / 8);
      this.position.elevation += (1500 + variance + Math.random() * (1500 - variance)) / Units.feetPerMeter;
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

export class ScenarioWeather {
  /**
   * @type {number} 0..1
   */
  #cloudCover = 0;

  /**
   * @type {"CLR"|"FEW"|"SCT"|"BKN"|"OVC"}
   */
  #cloudCoverCode = "CLR";

  /**
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiMetar} weatherJson
   */
  constructor(weatherJson) {
    /**
     * @type {number} in kts
     */
    this.windDirection = weatherJson.wdir === "VRB" ? 0 : weatherJson.wdir;

    /**
     * @type {number} in kts
     */
    this.windSpeed = weatherJson.wspd;

    /**
     * @type {number} in kts
     */
    this.windGusts = weatherJson.wgst ?? 0;

    /**
     * @type {number} in Statute Miles. Max is 15 for METAR values ending on a "+"
     */
    this.visibility = typeof weatherJson.visib === "string" ? 15 : weatherJson.visib;

    this.cloudCoverCode = weatherJson.clouds[0]?.cover;

    /**
     * @type {number} in ft
     */
    this.cloudBase = weatherJson.clouds[0]?.base ?? 0;

    /**
     * @type {number} 0..1
     */
    this.thermalStrength = Math.max(0, ((weatherJson.temp ?? 14) - 5) / 25);
  }

  /**
   * @returns {number} 0..1
   */
  get turbulenceStrength() {
    return Math.min(1, this.windSpeed / 80 + this.windGusts / 20);
  }

  /**
   *
   * @param {"CLR"|"FEW"|"SCT"|"BKN"|"OVC"} cloudCoverCode
   */
  set cloudCoverCode(cloudCoverCode) {
    this.#cloudCoverCode = cloudCoverCode;
    /**
     * @type {{[key:string]:[number,number]}}
     */
    const cover = {
      CLR: [0, 0], // 0
      FEW: [1 / 8, 1 / 8], // 1/8
      SCT: [2 / 8, 2 / 8], // 2/8
      BKN: [4 / 8, 3 / 8], // 4/8
      OVC: [7 / 8, 1 / 8], // 1
    };
    const actualCover = cloudCoverCode && cover[cloudCoverCode] ? cover[cloudCoverCode] : cover.CLR;

    this.#cloudCover = actualCover[0] + Math.random() * actualCover[1];
  }

  /**
   * @returns  {"CLR"|"FEW"|"SCT"|"BKN"|"OVC"}
   */
  get cloudCoverCode() {
    return this.#cloudCoverCode;
  }

  /**
   * @returns {number} 0..1
   */
  get cloudCover() {
    return this.#cloudCover;
  }
}
