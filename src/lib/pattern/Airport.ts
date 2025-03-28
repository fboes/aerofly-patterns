import { Vector, Point } from "@fboes/geojson";
import { Units } from "../../data/Units.js";
import { Degree } from "../general/Degree.js";
import { Airports } from "../../data/Airports.js";
import { Formatter } from "../general/Formatter.js";
import {
  AviationWeatherApiAirport,
  AviationWeatherApiNavaid,
  AviationWeatherNormalizedAirport,
  AviationWeatherNormalizedRunway,
} from "../general/AviationWeatherApi.js";
import { Configuration } from "./Configuration.js";

/**
 * @type  {AeroflyPatternsWaypointable}
 */
export class Airport {
  id: string;
  position: Point;
  name: string;
  runways: AirportRunway[];
  magneticDeclination: number;
  nauticalTimezone: number;
  hasTower: boolean;
  hasBeacon: boolean;
  localFrequency: number | null;
  navaids: AirportNavaid[];
  radioDescription: string;
  navAidDescription: string;

  constructor(airportApiData: AviationWeatherApiAirport, configuration: Configuration | null = null) {
    const airportNormalized = new AviationWeatherNormalizedAirport(airportApiData);

    this.id = airportNormalized.icaoId;
    this.position = new Point(airportNormalized.lon, airportNormalized.lat, airportNormalized.elev);
    this.name = airportNormalized.name;

    // Remove municipality name if already present in airport name
    const duplicateMatch = this.name.match(/^(.+?) \/ (.+)$/);
    if (duplicateMatch && duplicateMatch[2].includes(duplicateMatch[1])) {
      this.name = duplicateMatch[2];
    }

    this.runways = [];
    airportNormalized.runways.map((r) => {
      this.buildRunways(r, this.position, configuration).forEach((runway) => {
        if (runway) {
          this.runways.push(runway);
        }
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
    this.magneticDeclination = airportNormalized.magdec;

    /**
     * @type {number} a tome zone which only considers the longitude, rounded to the full hour, in hours difference to UTC
     * @see https://en.wikipedia.org/wiki/Nautical_time
     */
    this.nauticalTimezone = Math.round(this.position.longitude / 15);
    this.hasTower = airportNormalized.tower;
    this.hasBeacon = airportNormalized.beacon;

    const lclP = airportNormalized.freqs.find((f) => {
      return f.type === "LCL/P";
    });

    this.localFrequency = lclP?.freq ?? null;
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
   * @param {AviationWeatherApiNavaid[]} navaids
   */
  setNavaids(navaids: AviationWeatherApiNavaid[]) {
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

  get description(): string {
    return this.getDescription();
  }

  /**
   * @param {boolean} withNavAid if to include navigational aids in description
   * @returns {string}
   */
  getDescription(withNavAid: boolean = true): string {
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
   * @param {AviationWeatherNormalizedRunway} runwayApiData
   * @param {Point} airportPosition
   * @param  {Configuration?} configuration
   * @returns {AirportRunway[]} both directions, or in case of helipads on single helipad
   */
  buildRunways(
    runwayApiData: AviationWeatherNormalizedRunway,
    airportPosition: Point,
    configuration: Configuration | null,
  ): AirportRunway[] {
    /**
     * @type {[string,string]} both directions
     */
    const id: [string, string] = runwayApiData.id;

    /**
     * @type {[number,number]} length, width in ft
     */
    const dimension: [number, number] = runwayApiData.dimension;

    // Helipads & Water runways get an approximate alignment
    if (runwayApiData.alignment === null) {
      runwayApiData.alignment = Number(id[0].replace(/\D/g, "") + "0");
    }

    const alignmentBase = runwayApiData.alignment;
    if (isNaN(alignmentBase)) {
      return [];
    }

    /**
     * @type {[number, number]} both directions
     */
    const alignment: [number, number] = [alignmentBase, Degree(alignmentBase + 180)];

    /**
     * @type {[Point,Point]} both directions
     */
    const positions: [Point, Point] = [
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
 * @type  {AeroflyPatternsWaypointable}
 */
export class AirportRunway {
  id: string;
  position: Point;
  dimension: [number, (number | undefined)?];
  alignment: number;
  isRightPattern: boolean;
  isPreferred: boolean;
  ilsFrequency: number;
  runwayType: string | null;
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
  constructor(
    id: string,
    dimension: [number, number?],
    alignment: number,
    position: Point,
    isRightPattern: boolean = false,
    isPreferred: boolean = false,
    ilsFrequency: number = 0,
  ) {
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
 * @type  {AeroflyPatternsWaypointable}
 */
export class AirportNavaid {
  id: string;
  position: Point;
  type: string;
  frequency: number;

  constructor(navaidJson: AviationWeatherApiNavaid) {
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
