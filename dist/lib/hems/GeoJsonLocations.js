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
 *   "marker-symbol": string|null
 * }} properties
 * @property {{
 *   coordinates: [number, number]
 * }} geometry
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

    this.#validateGeoJsonFeatures(featureCollection.features);

    /**
     * @type {GeoJsonFeature[]}
     */
    this.heliports = featureCollection.features.filter((f) => {
      return f.properties && f.properties["marker-symbol"] === "heliport";
    });
    if (this.heliports.length === 0) {
      throw Error("Missing heliports in GeoJson file");
    }

    /**
     * @type {GeoJsonFeature[]}
     */
    this.hospitals = featureCollection.features.filter((f) => {
      return f.properties && f.properties["marker-symbol"] === "hospital";
    });
    if (this.hospitals.length === 0) {
      this.hospitals = this.heliports;
    }

    /**
     * @type {GeoJsonFeature[]}
     */
    this.other = featureCollection.features.filter((f) => {
      return (
        f.properties && f.properties["marker-symbol"] !== "heliport" && f.properties["marker-symbol"] !== "hospital"
      );
    });
    if (this.other.length === 0) {
      throw Error("Missing mission locations in GeoJson file");
    }
  }

  /**
   * @param {GeoJsonFeature[]} geoJsonFeatures
   */
  #validateGeoJsonFeatures(geoJsonFeatures) {
    for (const geoJsonFeature of geoJsonFeatures) {
      if (!geoJsonFeature.properties.title) {
        throw Error(`Missing properties.title in GeoJSONFearure ${geoJsonFeature.id}`);
      }
      if (!geoJsonFeature.geometry.coordinates) {
        throw Error(`Missing properties.geometry.coordinates in GeoJSONFearure ${geoJsonFeature.id}`);
      }
    }
  }
}
