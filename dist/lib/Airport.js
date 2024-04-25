// @ts-check

import { Vector, Point } from "@fboes/geojson";
import { Units } from "./Units.js";

/**
 * @type  {import('./AeroflyPatterns.js').AeroflyPatternsWaypointable}
 */
export class Airport {
  /**
   *
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiAirport} airportJson
   * @param {string[]} rightPatternRunways
   */
  constructor(airportJson, rightPatternRunways = []) {
    this.id = airportJson.id;
    this.position = new Point(airportJson.lon, airportJson.lat, airportJson.elev);

    /**
     * @type {string}
     */
    this.name = airportJson.name
      .replace(/^.+?\//g, "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/(^|\s)[a-z]/g, (char) => {
        return char.toUpperCase();
      });

    /**
     * @type {AirportRunway[]}
     */
    this.runways = [];
    airportJson.runways.map((r) => {
      this.buildRunways(r, this.position, rightPatternRunways).forEach((runway) => {
        this.runways.push(runway);
      });
    });

    /**
     * @type {number} with "+" to the east and "-" to the west. Substracted to a true heading this will give the magnetic heading.
     */
    this.magneticDeclination = 0;
    const mag_dec_match = airportJson.mag_dec.match(/^(\d+)(E|W)$/);
    if (mag_dec_match) {
      this.magneticDeclination = Number(mag_dec_match[1]);
      if (mag_dec_match[2] === "W") {
        this.magneticDeclination *= -1;
      }
    }

    /**
     * @type {number} at which UTC hour will the sun be lowest, aks LST 0:00
     */
    this.lstOffset = this.position.longitude / 15;

    /**
     * @type {boolean}
     */
    this.hasTower = airportJson.tower !== "-";

    /**
     * @type {boolean}
     */
    this.hasBeacon = airportJson.beacon !== "-";

    const lclP = airportJson.freqs.find((f) => {
      f.type = "LCL/P";
    });

    /**
     * @type {number?}
     */
    this.localFrequency = lclP ? lclP.freq : null;

    /**
     * @type {AirportNavaid[]}
     */
    this.navaids = [];
  }

  /**
   *
   * @param {import("./AviationWeatherApi.js").AviationWeatherApiNavaid[]} navaids
   */
  setNavaids(navaids) {
    this.navaids = navaids.map((n) => {
      return new AirportNavaid(n);
    });
  }

  /**
   *
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiRunway} runwayJson
   * @param {Point} airportPosition
   * @param {string[]} rightPatternRunways
   * @returns {[AirportRunway, AirportRunway]}
   */
  buildRunways(runwayJson, airportPosition, rightPatternRunways = []) {
    /**
     * @type {[string,string]} both directions
     */
    const id = ["", ""];
    runwayJson.id.split("/").forEach((i, index) => {
      id[index] = i;
    });

    /**
     * @type {[number,number]} length, width
     */
    const dimension = [0, 0];
    runwayJson.dimension
      .split("x")
      .map((x) => Number(x))
      .forEach((d, index) => {
        dimension[index] = d;
      });

    /**
     * @type {[number, number]} both directions
     */
    const alignment = [Number(runwayJson.alignment), (Number(runwayJson.alignment) + 180) % 360];

    /**
     * @type {[Point,Point]} both directions
     */
    const positions = [
      airportPosition.getPointBy(new Vector(dimension[0] / 2 / Units.feetPerMeter, alignment[0] + 180)),
      airportPosition.getPointBy(new Vector(dimension[0] / 2 / Units.feetPerMeter, alignment[1] + 180)),
    ];

    return [
      new AirportRunway(id[0], dimension, alignment[0], positions[0], rightPatternRunways.indexOf(id[0]) !== -1),
      new AirportRunway(id[1], dimension, alignment[1], positions[1], rightPatternRunways.indexOf(id[1]) !== -1),
    ];
  }
}

/**
 * @type  {import('./AeroflyPatterns.js').AeroflyPatternsWaypointable}
 */
export class AirportRunway {
  /**
   *
   * @param {string} id
   * @param {[number,number?]} dimension
   * @param {number} alignment
   * @param {Point} position
   * @param {boolean} isRightPattern
   */
  constructor(id, dimension, alignment, position, isRightPattern = false) {
    this.id = id;
    this.position = position;

    /**
     * @type {[number,number?]} length, width in ft
     */
    this.dimension = dimension;

    /**
     * @type {number}
     */
    this.alignment = alignment;

    /**
     * @type {boolean}
     */
    this.isRightPattern = isRightPattern;
  }
}

/**
 * @type  {import('./AeroflyPatterns.js').AeroflyPatternsWaypointable}
 */
export class AirportNavaid {
  /**
   *
   * @param {import("./AviationWeatherApi.js").AviationWeatherApiNavaid} navaidJson
   */
  constructor(navaidJson) {
    this.id = navaidJson.id;
    this.position = new Point(navaidJson.lon, navaidJson.lat, navaidJson.elev);

    /**
     * @type {"VORTAC"|"VOR/DME"|"TACAN"|"NDB"|"VOR"}
     */
    this.type = navaidJson.type;

    /**
     * @type {number}
     */
    this.frequency = navaidJson.freq;
  }
}

/**
 * A static list of right-hand pattern runways
 * @type {{[key:string]: string[]}} with `airportCode`: `list of right-hand pattern runways`
 */
export const AirportRunwayRightPatterns = {
  KBDU: ["26", "26G"],
  KEYW: ["9"],
  KHAF: ["30"],
  KMVY: ["24", "33"],
  KRTS: ["26", "32"],
};
