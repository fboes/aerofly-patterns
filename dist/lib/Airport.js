// @ts-check

import { Vector, Point } from "@fboes/geojson";
import { Units } from "../data/Units.js";
import { Degree } from "./Degree.js";
import { Airports } from "../data/Airports.js";
import { Formatter } from "./Formatter.js";

/**
 * @type  {import('./AeroflyPatterns.js').AeroflyPatternsWaypointable}
 */
export class Airport {
  /**
   *
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiAirport} airportJson
   * @param {import('./Configuration.js').Configuration?} configuration
   */
  constructor(airportJson, configuration = null) {
    this.id = airportJson.id;
    this.position = new Point(airportJson.lon, airportJson.lat, airportJson.elev);

    /**
     * @type {string}
     */
    this.name = airportJson.name
      .replace(/_/g, " ")
      .replace(/\bINTL\b/g, "INTERNATIONAL")
      .replace(/\bRGNL\b/g, "REGIONAL")
      .replace(/\bFLD\b/g, "FIELD")
      .replace(/(\/)/g, " $1 ")
      .toLowerCase()
      .replace(/(^|\s)[a-z]/g, (char) => {
        return char.toUpperCase();
      });

    // Remove municipality name if already present in airport name
    const duplicateMatch = this.name.match(/^(.+?) \/ (.+)$/);
    if (duplicateMatch && duplicateMatch[2].includes(duplicateMatch[1])) {
      this.name = duplicateMatch[2];
    }

    /**
     * @type {AirportRunway[]}
     */
    this.runways = [];
    airportJson.runways.map((r) => {
      this.buildRunways(r, this.position, configuration).forEach((runway) => {
        runway && this.runways.push(runway);
      });
    });

    const airportDatabase = Airports[this.id] ?? null;
    if (airportDatabase) {
      airportDatabase.runways.forEach((r) => {
        const matchingRunway = this.runways.find((rr) => {
          return rr.id === r.id;
        });
        if (matchingRunway) {
          if (!matchingRunway.isRightPattern && r.isRightPattern) {
            matchingRunway.isRightPattern = r.isRightPattern;
          }
          if (!matchingRunway.ilsFrequency && r.ilsFrequency) {
            matchingRunway.ilsFrequency = r.ilsFrequency;
          }
          if (!matchingRunway.isPreferred && r.isPreferred) {
            matchingRunway.isPreferred = r.isPreferred;
          }
        }
      });
    }

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
    this.hasTower = airportJson.tower === "T";

    /**
     * @type {boolean}
     */
    this.hasBeacon = airportJson.beacon === "B";

    const lclP = airportJson.freqs.find((f) => {
      return f.type === "LCL/P";
    });

    /**
     * @type {number?}
     */
    this.localFrequency = lclP?.freq ?? null;

    /**
     * @type {AirportNavaid[]}
     */
    this.navaids = [];

    /**
     * @type {string} Local description
     */
    this.radioDescription = this.localFrequency
      ? "- Local tower / CTAF frequency: " + this.localFrequency.toFixed(2)
      : "";

    /**
     * @type {string} Local description
     */
    this.navAidDescription = "";
  }

  /**
   *
   * @param {import("./AviationWeatherApi.js").AviationWeatherApiNavaid[]} navaids
   */
  setNavaids(navaids) {
    this.navaids = navaids.map((n) => {
      return new AirportNavaid(n);
    });

    if (this.navaids.length) {
      this.navAidDescription =
        "- Local navigational aids: " +
        this.navaids
          .map((n) => {
            return `${n.type} ${n.id} (${n.frequency.toFixed(n.type !== "NDB" ? 2 : 0)}) ${Formatter.getVector(
              this.position.getVectorTo(n.position),
            )}`;
          })
          .join(", ");
    }
  }

  /**
   * @returns {string}
   */
  get description() {
    return this.getDescription();
  }

  /**
   * @param {boolean} withNavAid if to include navigational aids in description
   * @returns {string}
   */
  getDescription(withNavAid = true) {
    let description = "";
    const anyDescription = this.radioDescription || (this.navAidDescription && withNavAid);
    if (!anyDescription) {
      return description;
    }

    if (this.radioDescription) {
      description += "\n" + this.radioDescription;
    }

    if (this.navAidDescription && withNavAid) {
      description += "\n" + this.navAidDescription;
    }
    return description;
  }

  /**
   *
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiRunway} runwayJson
   * @param {Point} airportPosition
   * @param  {import('./Configuration.js').Configuration?} configuration
   * @returns {AirportRunway[]} both directions, or in case of helipads on single helipad
   */
  buildRunways(runwayJson, airportPosition, configuration) {
    /**
     * @type {[string,string]} both directions
     */
    const id = ["", ""];
    runwayJson.id.split("/").forEach((i, index) => {
      id[index] = i;
    });

    /**
     * @type {[number,number]} length, width in ft
     */
    const dimension = [0, 0];
    runwayJson.dimension
      .split("x")
      .map((x) => Number(x))
      .forEach((d, index) => {
        dimension[index] = d;
      });

    // Helipads & Water runways get an approximate alignment
    if (runwayJson.alignment === "-") {
      runwayJson.alignment = id[0].replace(/\D/g, "") + "0";
    }

    const alignmentBase = Number(runwayJson.alignment);
    if (isNaN(alignmentBase)) {
      return [];
    }

    /**
     * @type {[number, number]} both directions
     */
    const alignment = [alignmentBase, Degree(alignmentBase + 180)];

    /**
     * @type {[Point,Point]} both directions
     */
    const positions = [
      airportPosition.getPointBy(new Vector(dimension[0] / 2 / Units.feetPerMeter, alignment[0] + 180)),
      airportPosition.getPointBy(new Vector(dimension[0] / 2 / Units.feetPerMeter, alignment[1] + 180)),
    ];

    const rightPatternRunways = [
      configuration && configuration.rightPatternRunways.length
        ? configuration.rightPatternRunways.indexOf(id[0]) !== -1
        : id[0].endsWith("R"),
      configuration && configuration.rightPatternRunways.length
        ? configuration.rightPatternRunways.indexOf(id[1]) !== -1
        : id[1].endsWith("R"),
    ];

    const runways = [
      new AirportRunway(
        id[0],
        dimension,
        alignment[0],
        positions[0],
        rightPatternRunways[0],
        configuration?.preferredRunways.indexOf(id[0]) !== -1,
      ),
    ];

    if (id[1] !== "") {
      runways.push(
        new AirportRunway(
          id[1],
          dimension,
          alignment[1],
          positions[1],
          rightPatternRunways[1],
          configuration?.preferredRunways.indexOf(id[1]) !== -1,
        ),
      );
    }

    return runways;
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
   * @param {boolean} isPreferred
   * @param {number} ilsFrequency
   */
  constructor(id, dimension, alignment, position, isRightPattern = false, isPreferred = false, ilsFrequency = 0) {
    this.id = id;
    this.position = position;

    /**
     * @type {[number,number?]} length, width in ft
     */
    this.dimension = dimension;

    const alignmentAdjustment = id.endsWith("R") ? 0.1 : 0;

    /**
     * @type {number}
     */
    this.alignment = Degree(alignment + alignmentAdjustment);

    /**
     * @type {boolean}
     */
    this.isRightPattern = isRightPattern;

    /**
     * @type {boolean} isPreferred most active runways, will be used in case wind is indecisive
     */
    this.isPreferred = isPreferred;

    /**
     * @type {number} in MHz
     */
    this.ilsFrequency = ilsFrequency;

    const endMatch = id.match(/([SGUW]$)|H/);

    /**
     * @property {"S"|"G"|"H"|"U"|"W"?} type STOL, Glider, Helicopter, Ultralight, Water, all
     */
    this.runwayType = endMatch ? endMatch[0] : null;
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
