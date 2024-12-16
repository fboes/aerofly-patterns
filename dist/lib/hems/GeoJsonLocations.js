// @ts-check

import { Point } from "@fboes/geojson";
import * as fs from "node:fs";

/**
 * @typedef GeoJsonFeature
 * @type {object}
 * @property {string} type
 * @property {string} id
 * @property {GeoJsonFeature[]} features
 * @property {{
 *   title: string,
 *   "marker-symbol": string|null,
 *   icaoCode?: string,
 *   direction?: number,
 *   approaches?: number[],
 *   url?: string
 * }} properties
 * @property {{
 *   coordinates: [number, number, number?],
 *   type: string
 * }} geometry with longitude, latitude, elevation (m)
 */

export class GeoJsonLocations {
  static MARKER_HOSPITAL = "hospital";
  static MARKER_HELIPORT = "heliport";
  static MARKER_HELIPORT_HOSPITAL = "hospital-JP";

  /**
   *
   * @param {string} filename
   */
  constructor(filename) {
    const rawData = fs.readFileSync(filename, "utf8");

    /** @type {GeoJsonFeature} */
    const featureCollection = JSON.parse(rawData);

    if (
      !featureCollection.type ||
      featureCollection.type !== "FeatureCollection" ||
      !featureCollection.features ||
      !Array.isArray(featureCollection.features)
    ) {
      throw Error("Missing FeatureCollection with features in GeoJSON file");
    }

    const pointFeatures = featureCollection.features
      .filter((f) => {
        return f.type === "Feature" && f.geometry.type === "Point";
      })
      .map((f) => {
        return new GeoJsonLocation(f);
      });

    if (pointFeatures.length === 0) {
      throw Error("Missing Features in GeoJson file");
    }

    /**
     * @type {GeoJsonLocation[]}
     */
    this.heliports = pointFeatures.filter((f) => {
      return f.isHeliport;
    });
    if (this.heliports.length === 0) {
      throw Error("Missing heliports in GeoJson file");
    }

    /**
     * @type {GeoJsonLocation[]}
     */
    this.hospitals = pointFeatures.filter((f) => {
      return f.isHospital;
    });
    if (this.hospitals.length === 0) {
      this.hospitals = this.heliports;
    }

    /**
     * @type {GeoJsonLocation[]}
     */
    this.other = pointFeatures.filter((f) => {
      return !f.isHeliport && !f.isHospital;
    });
    if (this.other.length === 0) {
      throw Error("Missing mission locations in GeoJson file");
    }

    /**
     * @type {Generator<GeoJsonLocation, void, unknown>}
     */

    this.randomEmergencySite = this.#yieldRandomEmergencySite();
  }

  /**
   * @returns {GeoJsonLocation[]}
   */
  get heliportsAndHospitals() {
    return (this.heliports ?? []).concat(
      this.hospitals?.filter((l) => {
        return l.markerSymbol !== GeoJsonLocations.MARKER_HELIPORT_HOSPITAL;
      }) ?? [],
    );
  }

  /**
   * Infinite generator of randomized `this.other`. On end of list will return to beginning, but keeping the random order.
   * @yields {GeoJsonLocation}
   * @generator
   */
  *#yieldRandomEmergencySite() {
    let i = this.other.length;
    let j = 0;
    let temp;
    //const emergencySites = structuredClone(this.other);
    /**
     * @type {number[]}
     */
    const emergencySiteIndexes = [...Array(i).keys()];

    while (i--) {
      j = Math.floor(Math.random() * (i + 1));

      // swap randomly chosen element with current element
      temp = emergencySiteIndexes[i];
      emergencySiteIndexes[i] = emergencySiteIndexes[j];
      emergencySiteIndexes[j] = temp;
    }

    while (emergencySiteIndexes.length) {
      for (const locationIndex of emergencySiteIndexes) {
        yield this.other[locationIndex];
      }
    }
  }

  /**
   *
   * @param {GeoJsonLocation} location
   * @returns {GeoJsonLocation}
   */
  getNearesHospital(location) {
    /** @type {number?} */
    let distance = null;
    let nearestLocation = this.hospitals[0];
    for (const testLocation of this.hospitals) {
      const vector = location.coordinates.getVectorTo(testLocation.coordinates);
      if (distance === null || vector.meters < distance) {
        nearestLocation = testLocation;
        distance = vector.meters;
      }
    }

    return nearestLocation;
  }

  /**
   * @param {GeoJsonLocation?} butNot
   * @returns {GeoJsonLocation}
   */
  getRandHospital(butNot = null) {
    return this.getRandLocation(this.hospitals, butNot);
  }

  /**
   * @returns {GeoJsonLocation}
   */
  getRandHeliport() {
    return this.getRandLocation(this.heliports);
  }

  /**
   * @param {GeoJsonLocation[]} locations
   * @param {GeoJsonLocation?} butNot
   * @returns {GeoJsonLocation}
   */
  getRandLocation(locations, butNot = null) {
    if (butNot && locations.length < 2) {
      throw Error("Not enough locations to search for an alternate");
    }
    let location = null;
    do {
      location = locations[Math.floor(Math.random() * locations.length)];
    } while (butNot && location.title === butNot?.title);
    return location;
  }
}

export class GeoJsonLocation {
  /**
   * @param {object} json
   */
  constructor(json) {
    if (!json.properties.title) {
      throw Error(`Missing properties.title in GeoJSONFeature ${json.id}`);
    }
    if (!json.geometry.coordinates) {
      throw Error(`Missing properties.geometry.coordinates in GeoJSONFeature ${json.id}`);
    }

    /**
     * @type {string}
     */
    this.type = json.type;

    /**
     * @type {string?}
     */
    this.id = json.id ?? null;

    this.coordinates = new Point(
      json.geometry.coordinates[0],
      json.geometry.coordinates[1],
      json.geometry.coordinates[2] ?? null,
    );

    /**
     * @type {string}
     */
    this.markerSymbol = json.properties["marker-symbol"] ?? "";

    /**
     * @type {string}
     */
    this.title = json.properties.title;

    /**
     * @type {string?}
     */
    this.icaoCode = json.properties.icaoCode?.replace(/[-]+/g, "") || null;
    if (this.icaoCode !== null && !this.icaoCode.match(/^[a-zA-Z0-9]+$/)) {
      throw new Error("Invalid icaoCode: " + this.icaoCode);
    }

    /**
     * @type {number}
     */
    this.direction = json.properties.direction ?? 0;

    /**
     * @type {number[]}
     */
    this.approaches = json.properties.approaches ?? [];
    if (
      json.properties.approaches == undefined &&
      json.properties.direction !== undefined &&
      json.properties.icaoCode !== undefined
    ) {
      this.approaches = [json.properties.direction, (json.properties.direction + 180) % 360];
    }

    /**
     * @type {string?}
     */
    this.url = json.properties.url ?? null;
  }

  /**
   * @returns {boolean}
   */
  get isHeliport() {
    return (
      this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT ||
      this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT_HOSPITAL
    );
  }

  /**
   * @returns {boolean}
   */
  get isHospital() {
    return (
      this.markerSymbol === GeoJsonLocations.MARKER_HOSPITAL ||
      this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT_HOSPITAL
    );
  }

  /**
   * @returns {string}
   */
  get checkPointName() {
    if (this.icaoCode) {
      return this.icaoCode.toUpperCase();
    }
    let name = this.isHospital ? "HOSPITAL" : "EVAC";

    return ("W-" + name).toUpperCase().replace(/[^A-Z0-9-]/, "");
  }
}
