// @ts-check

import { Vector, Point } from "@fboes/geojson";

/**
 * @typedef {object} AviationWeatherApiCloud
 * @property {"CAVOK"|"CLR"|"SKC"|"FEW"|"SCT"|"BKN"|"OVC"} cover with {CLR: 0, FEW: 1/8, SCT: 2/8, BKN: 4/8, OVC: 1}
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
 * @typedef {object} AviationWeatherApiFrequency
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
 * @property {string} rwyNum
 * @property {"T"|"-"|null} tower
 * @property {"B"|"-"|null} beacon
 * @property {AviationWeatherApiRunway[]} runways
 * @property {AviationWeatherApiFrequency[]|string} freqs or "LCL/P,123.9;ATIS,124.7"
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
        // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
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
        // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
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
        bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
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

export class AviationWeatherNormalizedAirport {
  /**
   * @param {AviationWeatherApiAirport} apiData
   */
  constructor({ icaoId, name, type, lat, lon, elev, magdec, rwyNum, tower, beacon, runways, freqs }) {
    /**
     * @type {string}
     */
    this.icaoId = icaoId;

    /**
     * @type {string}
     */
    this.name = name
      .replace(/_/g, " ")
      .trim()
      .replace(/\bINTL\b/g, "INTERNATIONAL")
      .replace(/\bRGNL\b/g, "REGIONAL")
      .replace(/\bFLD\b/g, "FIELD")
      .replace(/(\/)/g, " $1 ")
      .toLowerCase()
      .replace(/(^|\s)[a-z]/g, (char) => {
        return char.toUpperCase();
      });

    /**
     * @type {"ARP"|"HEL"}
     */
    this.type = type;

    /**
     * @type {number}
     */
    this.lat = lat;

    /**
     * @type {number}
     */
    this.lon = lon;

    /**
     * @type {number} in meters MSL
     */
    this.elev = elev;

    /**
     * @type {number} with "+" to the east and "-" to the west. Substracted to a true heading this will give the magnetic heading.
     */
    this.magdec = 0;
    const magdecMatch = magdec.match(/^(\d+)(E|W)$/);
    if (magdecMatch) {
      this.magdec = Number(magdecMatch[1]);
      if (magdecMatch[2] === "W") {
        this.magdec *= -1;
      }
    }

    /**
     * @type {number}
     */
    this.rwyNum = Number(rwyNum);

    /**
     * @type {boolean}
     */
    this.tower = tower === "T";

    /**
     * @type {boolean}
     */
    this.beacon = beacon === "B";

    /**
     * @type {AviationWeatherNormalizedRunway[]}
     */
    this.runways = runways.map((r) => {
      return new AviationWeatherNormalizedRunway(r);
    });

    /**
     * @type {AviationWeatherApiFrequency[]}
     */
    this.freqs =
      typeof freqs !== "string"
        ? freqs
        : freqs.split(";").map(
            /**
             * @param {string} f
             * @returns {AviationWeatherApiFrequency}
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
}

export class AviationWeatherNormalizedRunway {
  /**
   *
   * @param {AviationWeatherApiRunway} apiData
   */
  constructor({ id, dimension, surface, alignment }) {
    /**
     * @type {[string,string]} both directions
     */
    this.id = ["", ""];
    id.split("/").forEach((i, index) => {
      this.id[index] = i;
    });

    /**
     * @type {[number,number]} length, width in ft
     */
    this.dimension = [0, 0];
    dimension
      .split("x")
      .map((x) => Number(x))
      .forEach((d, index) => {
        this.dimension[index] = d;
      });

    /**
     * @type {AviationWeatherApiRunwaySurface}
     */
    this.surface = surface;

    /**
     * @type {number?}
     */
    this.alignment = alignment !== "-" ? Number(alignment) : null;
  }
}

export class AviationWeatherNormalizedMetar {
  /**
   *
   * @param {AviationWeatherApiMetar} apiData
   */
  constructor({ icaoId, reportTime, temp, dewp, wdir, wspd, wgst, visib, altim, lat, lon, elev, clouds }) {
    /**
     * @type {string}
     */
    this.icaoId = icaoId;

    /**
     * @type {Date}
     */
    this.reportTime = new Date(Date.parse(reportTime + " GMT"));

    /**
     * @type {number} in °C
     */
    this.temp = temp;

    /**
     * @type {number} in °C
     */
    this.dewp = dewp;

    /**
     * @type {number?} in °, null on VRB
     */
    this.wdir = wdir !== "VRB" ? wdir : null;

    /**
     * @type {number} in kts
     */
    this.wspd = wspd;

    /**
     * @type {number?} in kts
     */
    this.wgst = wgst;

    /**
     * @type {number} in SM, 99 on any distance being open-ended
     */
    this.visib = typeof visib === "string" ? 99 : visib;

    /**
     * @type {number} in hPa
     */
    this.altim = altim;

    /**
     * @type {number}
     */
    this.lat = lat;

    /**
     * @type {number}
     */
    this.lon = lon;

    /**
     * @type {number} meters MSL
     */
    this.elev = elev;

    /**
     * @type {AviationWeatherNormalizedCloud[]}
     */
    this.clouds = clouds.map((c) => {
      return new AviationWeatherNormalizedCloud(c);
    });
  }
}

export class AviationWeatherNormalizedCloud {
  /**
   * @param {AviationWeatherApiCloud} apiData
   */
  constructor({ cover, base }) {
    /**
     * @type {"CLR"|"FEW"|"SCT"|"BKN"|"OVC"}
     */
    this.cover = cover === "CAVOK" || cover === "SKC" ? "CLR" : cover;

    const coverOctas = {
      CLR: 0,
      FEW: 1,
      SCT: 2,
      BKN: 4,
      OVC: 8,
    };

    /**
     * @type {number} 0..8
     */
    this.coverOctas = coverOctas[this.cover] ?? 0;

    /**
     * @type {number?} in feet AGL
     */
    this.base = base;
  }
}
