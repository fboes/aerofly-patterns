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
      .replace("_", " ")
      .replace("/", " / ")
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
     * @type {number}
     */
    this.magneticDeclination = 0;
    const mag_dec_match = airportJson.mag_dec.match(/^(\d+)(E|W)$/);
    if (mag_dec_match) {
      this.magneticDeclination = Number(mag_dec_match[1]);
      if (mag_dec_match[2] === "E") {
        this.magneticDeclination *= -1;
      }
    }

    /**
     * @type {number} at which UTC hour will the sun be highest, aks LST 12:00
     */
    this.lstOffset = 12 - this.position.longitude / 15;

    /**
     * @type {boolean}
     */
    this.hasTower = airportJson.tower !== "-";

    /**
     * @type {boolean}
     */
    this.hasBeacon = airportJson.beacon !== "-";
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
     * @type {[string,string]}
     */
    const id = ["", ""];
    runwayJson.id.split("/").forEach((i, index) => {
      id[index] = i;
    });

    /**
     * @type {[number,number]}
     */
    const dimension = [0, 0];
    runwayJson.dimension
      .split("x")
      .map((x) => Number(x))
      .forEach((d, index) => {
        dimension[index] = d;
      });

    /**
     * @type {[number, number]}
     */
    const alignment = [Number(runwayJson.alignment), (Number(runwayJson.alignment) + 180) % 360];

    /**
     * @type {[Point,Point]}
     */
    const positions = [
      airportPosition.getPointBy(new Vector((dimension[0] / 2) * Units.feetPerMeter, alignment[0] + 180)),
      airportPosition.getPointBy(new Vector((dimension[0] / 2) * Units.feetPerMeter, alignment[1] + 180)),
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
     * @type {[number,number?]}
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
