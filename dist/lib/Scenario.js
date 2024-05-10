// @ts-check

import { Vector } from "@fboes/geojson";
import { Units } from "../data/Units.js";
import { Configuration } from "./Configuration.js";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
import { Formatter } from "./Formatter.js";
import { AeroflyAircraftFinder } from "../data/AeroflyAircraft.js";
import { Degree, degreeDifference, degreeToRad } from "./Degree.js";

/**
 * A scenario consists of the plane and its position relative to the airport,
 * the weather,
 * the active runway
 * and the entry method.
 */
export class Scenario {
  /**
   * @param {import('./Airport.js').Airport} airport
   * @param {Configuration} configuration
   * @param {Date?} date
   */
  constructor(airport, configuration, date = null) {
    this.airport = airport;
    this.configuration = configuration;

    /**
     * @type {number} in feet
     */
    let mimimumSafeAltitude = Math.max(
      (this.airport.position.elevation ?? 0) + 1500,
      configuration.mimimumSafeAltitude,
    );

    /**
     * @type {ScenarioAircraft}
     */
    this.aircraft = new ScenarioAircraft(
      airport,
      configuration.aircraft,
      configuration.initialDistance,
      mimimumSafeAltitude,
    );

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
     * @type {number} in feet per second
     */
    this.activeRunwayCrosswindComponent = 0;

    /**
     * @type {import("./AeroflyPatterns.js").AeroflyPatternsWaypointable[]}
     */
    this.patternWaypoints = [];
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
      return Math.abs(degreeDifference(alignment, counterWindDirection));
    };

    const possibleRunways = this.airport.runways
      .filter((r) => {
        return r.runwayType === null || r.runwayType === this.aircraft.data.type;
      })
      .filter((r) => {
        return (
          this.aircraft.data.runwayLanding === undefined ||
          this.aircraft.data.runwayLanding === 0 ||
          this.aircraft.data.runwayLanding <= r.dimension[0]
        );
      });

    this.activeRunway = possibleRunways.reduce((a, b) => {
      return difference(a.alignment) < difference(b.alignment) ? a : b;
    });

    const exitDistance = 1 * Units.meterPerNauticalMile;
    const downwindDistance = 1 * Units.meterPerNauticalMile;
    const finalDistance = 1 * Units.meterPerNauticalMile;

    if (this.weather?.windDirection) {
      const crosswindAngle = degreeDifference(this.activeRunway.alignment, this.weather.windDirection);
      this.activeRunwayCrosswindComponent = Math.sin(degreeToRad(crosswindAngle)) * this.weather.windSpeed;
    }

    const activeRunwayEntry = this.activeRunway.position.getPointBy(
      new Vector(finalDistance, Degree(this.activeRunway.alignment + 180)),
    );
    if (activeRunwayEntry.elevation) {
      activeRunwayEntry.elevation += 1000 / Units.feetPerMeter;
    }
    const activeRunwayExit = this.activeRunway.position.getPointBy(
      new Vector(this.activeRunway.dimension[0] / Units.feetPerMeter + exitDistance, this.activeRunway.alignment),
    );
    if (activeRunwayExit.elevation) {
      activeRunwayExit.elevation += 1000 / Units.feetPerMeter;
    }
    const patternOrientation = this.activeRunway.alignment + Degree(this.activeRunway.isRightPattern ? 90 : 270);

    this.patternWaypoints = [
      {
        id: this.activeRunway.id + "-CROSS",
        position: activeRunwayExit,
      },
      {
        id: this.activeRunway.id + "-DOWN",
        position: activeRunwayExit.getPointBy(new Vector(downwindDistance, patternOrientation)),
      },
      {
        id: this.activeRunway.id + "-BASE",
        position: activeRunwayEntry.getPointBy(new Vector(downwindDistance, patternOrientation)),
      },
      {
        id: this.activeRunway.id + "-FINAL",
        position: activeRunwayEntry,
      },
    ];
  }

  /**
   * @returns {string?}
   */
  get description() {
    if (!this.activeRunway) {
      return null;
    }

    //const distance = Formatter.getNumberString(this.aircraft.distanceFromAirport);
    const bearing = Formatter.getDirection(this.aircraft.bearingFromAirport - this.airport.magneticDeclination);
    const towered = this.airport.hasTower ? "towered" : "untowered";
    let weatherAdjectives = this.weather ? Formatter.getWeatherAdjectives(this.weather) : "";
    if (weatherAdjectives) {
      weatherAdjectives = `a ${weatherAdjectives} `;
    }

    let crossWind = "";
    if (this.activeRunwayCrosswindComponent > 4.5) {
      crossWind = ` / ${Math.ceil(this.activeRunwayCrosswindComponent)} kn crosswind component`;
    }
    const runway = `${this.activeRunway.id} (${Math.round(this.activeRunway.alignment - this.airport.magneticDeclination)}° / ${Math.round(this.activeRunway.dimension[0] / Units.feetPerMeter).toLocaleString("en")}m${crossWind})`;

    const elevation =
      this.airport.position.elevation !== null
        ? ` (${Math.ceil(this.airport.position.elevation * Units.feetPerMeter).toLocaleString("en")}ft)`
        : "";

    let description = `It is ${weatherAdjectives}${Formatter.getLocalDaytime(this.date, this.airport.lstOffset)}, and you are ${this.aircraft.distanceFromAirport} NM to the ${bearing} of the ${towered} airport ${this.airport.name}${elevation}. `;

    description += this.weather
      ? `As the wind is ${this.weather.windSpeed ?? 0} kn from ${this.weather.windDirection ?? 0}°, the main landing runway is ${runway}. `
      : `The main landing runway is ${runway}. `;

    if (this.activeRunway.ilsFrequency && !this.aircraft.data.hasNoRadioNav) {
      description += `You may want to use the ILS (${this.activeRunway.ilsFrequency.toFixed(2)}). `;
    }

    description += `Fly the ${this.activeRunway.isRightPattern ? "right-turn " : ""}pattern and land safely.`;

    if (this.airport.localFrequency || this.airport.navaids.length) {
      description += "\n";
    }
    if (this.airport.localFrequency) {
      description += "\nLocal tower / CTAF frequency: " + this.airport.localFrequency.toFixed(2);
    }
    if (this.airport.navaids.length && !this.aircraft.data.hasNoRadioNav) {
      description +=
        "\nLocal navigational aids: " +
        this.airport.navaids
          .map((n) => {
            return `${n.type} ${n.id} (${n.frequency.toFixed(n.type !== "NDB" ? 2 : 0)})`;
          })
          .join(", ");
    }

    return description;
  }

  /**
   * @returns {import("./AeroflyPatterns.js").AeroflyPatternsCheckpoint[]} `Waypoint, type, length, frequency`; will return an empty array if not all preconditions are met
   */
  get waypoints() {
    if (!this.activeRunway) {
      return [];
    }

    /**
     * @type {import("./AeroflyPatterns.js").AeroflyPatternsCheckpoint[]}
     */
    const waypoints = [
      {
        waypoint: this.airport,
        type: "origin",
      },
      {
        waypoint: this.activeRunway,
        type: "departure_runway",
        length: this.activeRunway.dimension[0] / Units.feetPerMeter,
        frequency: this.activeRunway.ilsFrequency * 1_000_000,
      },
    ];

    this.patternWaypoints.forEach((p) => {
      waypoints.push({
        waypoint: p,
        type: "waypoint",
      });
    });

    waypoints.push(
      {
        waypoint: this.activeRunway,
        type: "destination_runway",
        length: this.activeRunway.dimension[0] / Units.feetPerMeter,
        frequency: this.activeRunway.ilsFrequency * 1_000_000,
      },
      {
        waypoint: this.airport,
        type: "destination",
      },
    );

    return waypoints;
  }
}

/**
 * @type  {import('./AeroflyPatterns.js').AeroflyPatternsWaypointable}
 */
class ScenarioAircraft {
  /**
   *
   * @param {import('./Airport.js').Airport} airport
   * @param {string} aircraftCode Aerofly Aircraft Code
   * @param {number} distanceFromAirport
   * @param {number} mimimumSafeAltitude in ft
   */
  constructor(airport, aircraftCode, distanceFromAirport, mimimumSafeAltitude) {
    /**
     * @type {number} true bearing. 0..360
     */
    this.bearingFromAirport = Math.random() * 360;

    /**
     * @type {number} in Nautical Miles
     */
    this.distanceFromAirport = distanceFromAirport;

    this.position = airport.position.getPointBy(new Vector(this.distanceFromAirport * 1852, this.bearingFromAirport));

    const altitude =
      this.bearingFromAirport > 180 // bearing - 180 = course
        ? Math.ceil((mimimumSafeAltitude - 1500) / 2000) * 2000 + 1500 // 3500, 5500, ..
        : Math.ceil((mimimumSafeAltitude - 500) / 2000) * 2000 + 500; // 4500, 6500, ..
    this.position.elevation = altitude / Units.feetPerMeter;

    this.id = "current";

    /**
     * @type {string}
     */
    this.aeroflyCode = aircraftCode;

    /**
     * @type {import('../data/AeroflyAircraft.js').AeroflyAircraft} additional aircraft information like name and technical properties
     */
    this.data = AeroflyAircraftFinder.get(aircraftCode);
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
     * @type {number} in kn
     */
    this.windDirection = weatherJson.wdir === "VRB" ? 0 : Degree(weatherJson.wdir);

    /**
     * @type {number} in kn
     */
    this.windSpeed = weatherJson.wspd;

    /**
     * @type {number} in kn
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
   * @param {"CAVOK"|"CLR"|"FEW"|"SCT"|"BKN"|"OVC"} cloudCoverCode
   */
  set cloudCoverCode(cloudCoverCode) {
    if (cloudCoverCode === "CAVOK") {
      cloudCoverCode = "CLR";
    }
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
    const actualCover = cover[cloudCoverCode] ? cover[cloudCoverCode] : cover.CLR;

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
