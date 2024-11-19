//@ts-check

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { GeoJsonLocations } from "./GeoJsonLocations.js";
import { strict as assert } from "node:assert";

export default class GeoJsonLocationsTest {
  constructor() {
    /**
     * @type {string}
     */
    this.geoJsonFileName = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data/hems/lueneburg.geojson");

    this.testRandomEmergencySites();
  }

  testRandomEmergencySites() {
    let i = 50;
    const g = new GeoJsonLocations(this.geoJsonFileName);

    while (i--) {
      assert.ok(g.randomEmergencySite.next().value?.properties?.title);
    }
    console.log(`✅ ${this.constructor.name}.testRandomEmergencySites successful`);
  }
}
