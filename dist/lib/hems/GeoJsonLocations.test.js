//@ts-check

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { GeoJsonLocation, GeoJsonLocations } from "./GeoJsonLocations.js";
import { strict as assert } from "node:assert";

export class GeoJsonLocationsTest {
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
      assert.ok(g.randomEmergencySite.next().value?.title);
    }
    console.log(`✅ ${this.constructor.name}.testRandomEmergencySites successful`);
  }
}

export class GeoJsonLocationTest {
  constructor() {
    this.testApproaches();
  }

  testApproaches() {
    {
      const json = {
        properties: {
          title: "Test",
          icaoCode: "TEST",
          approaches: [1, 2],
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);

      assert.deepStrictEqual(location.title, "Test");
      assert.deepStrictEqual(location.icaoCode, "TEST");
      assert.deepStrictEqual(location.approaches, [1, 2]);
    }

    {
      const json = {
        properties: {
          title: "Test",
          icaoCode: "TEST",
          approaches: [0],
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);

      assert.deepStrictEqual(location.approaches, [0]);
    }

    {
      const json = {
        properties: {
          title: "Test",
          icaoCode: "TEST",
          direction: 0,
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);

      assert.deepStrictEqual(location.approaches, [0, 180]);
    }

    {
      const json = {
        properties: {
          title: "Test",
          icaoCode: "TEST",
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);

      assert.deepStrictEqual(location.approaches, []);
    }

    {
      const json = {
        properties: {
          title: "Test",
          direction: 0,
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);

      assert.deepStrictEqual(location.approaches, []);
    }

    console.log(`✅ ${this.constructor.name}.testApproaches successful`);
  }
}
