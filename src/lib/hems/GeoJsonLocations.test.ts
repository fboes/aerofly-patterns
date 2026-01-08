import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { GeoJsonLocation, GeoJsonLocations } from "./GeoJsonLocations.js";

describe("GeoJsonLocations", () => {
  it("should handle random emergency sites correctly", () => {
    /**
     * @type {string}
     */
    const geoJsonFileName = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../src/data/hems/lueneburg.geojson",
    );

    let i = 50;
    const g = new GeoJsonLocations(geoJsonFileName);

    while (i--) {
      assert.ok(g.randomEmergencySite.next().value);
    }
  });
});

describe("GeoJsonLocation", () => {
  it("should handle approaches correctly", () => {
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
  });

  it("should handle icaoCode correctly", () => {
    {
      const json = {
        properties: {
          title: "Test",
          icaoCode: "",
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);

      assert.strictEqual(location.icaoCode, null);
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

      assert.strictEqual(location.icaoCode, "TEST");
    }

    {
      const json = {
        properties: {
          title: "Test",
          icaoCode: "TE-ST-123",
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);

      assert.strictEqual(location.icaoCode, "TEST123");
    }

    assert.throws(() => {
      const json = {
        properties: {
          title: "Test",
          icaoCode: "ü-()",
        },
        geometry: {
          coordinates: [1, 2, 3],
        },
      };
      const location = new GeoJsonLocation(json);
      assert.ok(location.icaoCode);
    });
  });
});
