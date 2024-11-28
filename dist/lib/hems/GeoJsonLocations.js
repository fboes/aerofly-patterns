// @ts-check

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
 *   direction?: number
 * }} properties
 * @property {{
 *   coordinates: [number, number, number?],
 *   type: string
 * }} geometry with longitude, latitude, elevation (m)
 */

export class GeoJsonLocations {
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

    const pointFeatures = featureCollection.features.filter((f) => {
      return f.type === "Feature" && f.geometry.type === "Point";
    });
    if (pointFeatures.length === 0) {
      throw Error("Missing Features in GeoJson file");
    }
    this.#validateGeoJsonFeatures(pointFeatures);

    /**
     * @type {GeoJsonFeature[]}
     */
    this.heliports = pointFeatures.filter((f) => {
      return f.properties && f.properties["marker-symbol"] === "heliport";
    });
    if (this.heliports.length === 0) {
      throw Error("Missing heliports in GeoJson file");
    }

    /**
     * @type {GeoJsonFeature[]}
     */
    this.hospitals = pointFeatures.filter((f) => {
      return (
        f.properties &&
        (f.properties["marker-symbol"] === "hospital" || f.properties["marker-symbol"] === "hospital-JP")
      );
    });
    if (this.hospitals.length === 0) {
      this.hospitals = this.heliports;
    }

    /**
     * @type {GeoJsonFeature[]}
     */
    this.other = pointFeatures.filter((f) => {
      return (
        f.properties &&
        f.properties["marker-symbol"] !== "heliport" &&
        f.properties["marker-symbol"] !== "hospital" &&
        f.properties["marker-symbol"] !== "hospital-JP"
      );
    });
    if (this.other.length === 0) {
      throw Error("Missing mission locations in GeoJson file");
    }

    /**
     * @type {Generator<GeoJsonFeature, void, unknown>}
     */

    this.randomEmergencySite = this.#yieldRandomEmergencySite();
  }

  /**
   * Infinite generator of randomized `this.other`. On end of list will return to beginning, but keeping the random order.
   * @yields {GeoJsonFeature}
   * @generator
   */
  *#yieldRandomEmergencySite() {
    let i = this.other.length;
    let j = 0;
    let temp;
    const emergencySites = structuredClone(this.other);

    while (i--) {
      j = Math.floor(Math.random() * (i + 1));

      // swap randomly chosen element with current element
      temp = emergencySites[i];
      emergencySites[i] = emergencySites[j];
      emergencySites[j] = temp;
    }

    while (emergencySites.length) {
      for (const location of emergencySites) {
        yield location;
      }
    }
  }

  /**
   * @param {GeoJsonFeature[]} geoJsonFeatures
   */
  #validateGeoJsonFeatures(geoJsonFeatures) {
    for (const geoJsonFeature of geoJsonFeatures) {
      if (!geoJsonFeature.properties.title) {
        throw Error(`Missing properties.title in GeoJSONFeature ${geoJsonFeature.id}`);
      }
      if (!geoJsonFeature.geometry.coordinates) {
        throw Error(`Missing properties.geometry.coordinates in GeoJSONFeature ${geoJsonFeature.id}`);
      }
    }
  }
}
