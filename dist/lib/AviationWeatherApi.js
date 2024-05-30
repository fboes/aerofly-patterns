// @ts-check

import { Vector } from "@fboes/geojson";
import { Point } from "@fboes/geojson";

/**
 * @typedef {object} AviationWeatherApiCloud
 * @property {"CAVOK"|"CLR"|"FEW"|"SCT"|"BKN"|"OVC"} cover with {CLR: 0, FEW: 1/8, SCT: 2/8, BKN: 4/8, OVC: 1}
 * @property {number} base 1900 ft AGL
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */

/**
 * @typedef {object} AviationWeatherApiMetar
 * @property {string} icaoId "KMCI"
 * @property {string} reportTime "2024-04-19 07:00:00"
 * @property {number} temp °C
 * @property {number} dewp °C
 * @property {"VRB"|number} wdir ° | "VRB"
 * @property {number} wspd kn
 * @property {number?} wgst kn
 * @property {string|number} visib "10+" in SM. Max values can be anything with a "+"
 * @property {number} altim hPa
 * @property {number} lat
 * @property {number} lon
 * @property {number} elev 313.1 meters MSL
 * @property {AviationWeatherApiCloud[]} clouds
 * @see https://aviationweather.gov/data/api/#/Data/dataMetar
 */

/**
 * @typedef {"A"|"C"|"G"|"W"} AviationWeatherApiRunwaySurface  "A" Asphalt, "C" Concrete, "G" Grass, "W" Water
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
 * @property {string} id "KMCI"
 * @property {string} name "KANSAS CITY/KANSAS_CITY_INTL"
 * @property {number} lat
 * @property {number} lon
 * @property {number} elev 313.1 meters MSL
 * @property {string} mag_dec "02E" for East
 * @property {number} rwy_num
 * @property {"T"|"-"|null} tower
 * @property {"B"|"-"|null} beacon
 * @property {AviationWeatherApiRunway[]} runways
 * @property {AviationWeatherApiFrequencies[]} freqs
 * @see https://aviationweather.gov/data/api/#/Data/dataAirport
 */

/**
 * @typedef {object} AviationWeatherApiAirportAlternate
 * @property {string} icaoId "KMCI"
 * @property {string} name "KANSAS CITY/KANSAS_CITY_INTL"
 * @property {string} lat
 * @property {string} lon
 * @property {string} elev 313.1 meters MSL
 * @property {string} magdec "02E" for East
 * @property {number} rwyNum
 * @property {"T"|"-"|null} tower
 * @property {"B"|"-"|null} beacon
 * @property {string} runways
 * @property {string} freqs
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
   * @returns {Promise<AviationWeatherApiAirport[]>}
   */
  static async fetchAirports(ids) {
    return AviationWeatherApi.doRequest(
      "/api/data/airport",
      new URLSearchParams({
        ids: ids.join(","),
        format: "json",
      }),
    );
  }

  /**
   *
   * @param {string[]} ids
   * @returns {Promise<AviationWeatherApiAirport[]>}
   */
  static async fetchAirportsAlternate(ids) {
    /** @type {AviationWeatherApiAirportAlternate[]} */
    const response = await AviationWeatherApi.doRequest(
      "/api/data/airport",
      new URLSearchParams({
        ids: ids.join(","),
        format: "json",
      }),
    );

    return response.map(
      /**
       * @param {AviationWeatherApiAirportAlternate} alternate
       * @returns {AviationWeatherApiAirport}
       */
      (alternate) => {
        return {
          id: alternate.icaoId,
          name: alternate.name,
          lat: Number(alternate.lat),
          lon: Number(alternate.lon),
          elev: Number(alternate.elev),
          mag_dec: alternate.magdec,
          rwy_num: Number(alternate.rwyNum),
          tower: alternate.tower,
          beacon: alternate.beacon,
          runways: alternate.runways.split(";").map(
            /**
             *
             * @param {string} r
             * @returns {AviationWeatherApiRunway}
             */
            (r) => {
              const runwayProperties = r.split(",");

              /**
               * @type {AviationWeatherApiRunwaySurface}
               */
              let surface = "A";
              switch (runwayProperties[2]) {
                case "C":
                  surface = "C";
                  break;
                case "G":
                  surface = "G";
                  break;
              }

              return {
                id: runwayProperties[0],
                dimension: runwayProperties[1],
                surface: surface,
                alignment: runwayProperties[3],
              };
            },
          ),
          freqs: alternate.freqs.split(";").map(
            /**
             *
             * @param {string} r
             * @returns {AviationWeatherApiFrequencies}
             */
            (r) => {
              const freqProperties = r.split(",");
              return {
                type: freqProperties[0],
                freq: Number(freqProperties[1] ?? null),
              };
            },
          ),
        };
      },
    );
  }

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
        date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
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
    const southEast = position.getPointBy(new Vector(distance, 225));
    const northWest = position.getPointBy(new Vector(distance, 45));
    return AviationWeatherApi.doRequest(
      "/api/data/navaid",
      new URLSearchParams({
        format: "json",
        bbox: [southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude].join(","),
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
    //console.log(`https://aviationweather.gov${route}?${query}`);
    const response = await fetch(`https://aviationweather.gov${route}?${query}`, {
      headers: {
        Accept: "application/json",
      },
    });
    return await response.json();
  }
}
