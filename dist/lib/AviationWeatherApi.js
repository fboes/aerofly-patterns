// @ts-check

import { Vector } from "@fboes/geojson";
import { Point } from "@fboes/geojson";

/**
 * @typedef {object} AviationWeatherApiCloud
 * @property {"CAVOK"|"CLR"|"FEW"|"SCT"|"BKN"|"OVC"} cover with {CLR: 0, FEW: 1/8, SCT: 2/8, BKN: 4/8, OVC: 1}
 * @property {number?} base 1900 ft AGL
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */

/**
 * @typedef {object} AviationWeatherApiMetar
 * @property {string} icaoId "KMCI"
 * @property {string} reportTime "2024-04-19 07:00:00"
 * @property {number} temp °C
 * @property {number} dewp °C
 * @property {"VRB"|number} wdir ° | "VRB"
 * @property {number} wspd kts
 * @property {number?} wgst kts
 * @property {string|number} visib "10+" / "6+" in SM. Max values can be anything with a "+"
 * @property {number} altim hPa
 * @property {number} lat
 * @property {number} lon
 * @property {number} elev 313.1 meters MSL
 * @property {AviationWeatherApiCloud[]} clouds
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */

/**
 * @typedef {"A"|"C"|"G"|"W"|"T"|"H"} AviationWeatherApiRunwaySurface  "A" Asphalt, "C" Concrete, "G" Grass, "W" Water, "T" Turf Dirt, "H" Hard
 */

/**
 * @typedef {object} AviationWeatherApiRunway
 * @property {string} id "01L/19R"
 * @property {string} dimension "10801x150" in feet
 * @property {AviationWeatherApiRunwaySurface} surface
 * @property {string} alignment "013" or "-"
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */

/**
 * @typedef {object} AviationWeatherApiFrequencies
 * @property {string} type "LCL/P" or "-"
 * @property {number} [freq] 121.4
 */

/**
 * @typedef {object} AviationWeatherApiAirport
 * @property {string} icaoId "KMCI"
 * @property {string} name "KANSAS CITY/KANSAS_CITY_INTL"
 * @property {"ARP"|"HEL"} type Airport, Heliport
 * @property {number} lat
 * @property {number} lon
 * @property {number} elev 313.1 meters MSL
 * @property {string} magdec "02E" for East, "--" obiously for true headings
 * @property {number} rwyNum
 * @property {"T"|"-"|null} tower
 * @property {"B"|"-"|null} beacon
 * @property {AviationWeatherApiRunway[]} runways
 * @property {AviationWeatherApiFrequencies[]|string} freqs or "LCL/P,123.9;ATIS,124.7"
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */

/**
 * @typedef {object} AviationWeatherApiNavaid
 * @property {string} id "BDF"
 * @property {"VORTAC"|"VOR/DME"|"TACAN"|"NDB"|"VOR"} type
 * @property {string} name "BRADFORD"
 * @property {number} lat
 * @property {number} lon
 * @property {number} elev 313.1 meters MSL
 * @property {number} freq 114.7
 * @property {string} mag_dec "02E" for East
 * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
 */

export class AviationWeatherApi {
  /**
   *
   * @param {string[]} ids
   * @param {?Date} date to yyyy-mm-ddThh:mm:ssZ
   * @returns {Promise<AviationWeatherApiMetar[]>}
   */
  static async fetchMetar(ids, date = null) {
    return AviationWeatherApi.doRequest(
      "/api/data/metar",
      new URLSearchParams({
        ids: ids.join(","),
        format: "json",
        // taf,
        // hours,
        // bbox: AviationWeatherApiHelpers.buildBbox(position, distance).join(","),
        date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
      }),
    );
  }

  /**
   *
   * @param {string[]} ids
   * @returns {Promise<AviationWeatherApiAirport[]>}
   */
  static async fetchAirports(ids) {
    return AviationWeatherApi.doRequest(
      "/api/data/airport",
      new URLSearchParams({
        ids: ids.join(","),
        // bbox: AviationWeatherApiHelpers.buildBbox(position, distance).join(","),
        format: "json",
      }),
    );
  }

  /**
   *
   * @param {Point} position
   * @param {number} distance in meters
   * @returns {Promise<AviationWeatherApiNavaid[]>}
   */
  static async fetchNavaid(position, distance = 1000) {
    return AviationWeatherApi.doRequest(
      "/api/data/navaid",
      new URLSearchParams({
        // ids: ids.join(","),
        format: "json",
        bbox: AviationWeatherApiHelpers.buildBbox(position, distance).join(","),
      }),
    );
  }

  /**
   *
   * @param {string} route
   * @param {URLSearchParams} query
   * @returns {Promise}
   */
  static async doRequest(route, query) {
    const url = new URL(route + "?" + query, "https://aviationweather.gov");
    //console.log(url);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    return await response.json();
  }
}

export class AviationWeatherApiHelpers {
  /**
   *
   * @param {AviationWeatherApiFrequencies[]|string} freq
   * @returns {AviationWeatherApiFrequencies[]}
   */
  static fixFrequencies(freq) {
    if (typeof freq !== "string") {
      return freq;
    }

    return freq.split(";").map(
      /**
       *
       * @param {string} f
       * @returns {AviationWeatherApiFrequencies}
       */
      (f) => {
        const parts = f.split(",");
        return {
          type: parts[0],
          freq: parts[1] ? Number(parts[1]) : undefined,
        };
      },
    );
  }

  /**
   *
   * @param {Point} position
   * @param {number} [distance] in meters
   * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
   */
  static buildBbox(position, distance = 1000) {
    const southEast = position.getPointBy(new Vector(distance, 225));
    const northWest = position.getPointBy(new Vector(distance, 45));
    return [southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude];
  }
}
