// @ts-check

import { strict as assert } from "node:assert";
import { AviationWeatherApi, AviationWeatherApiHelpers } from "./AviationWeatherApi.js";

export class AviationWeatherApiTest {
  constructor() {
    this.fetchAirports();
    this.fetchMetar();
  }

  async fetchAirports() {
    const icaoCodes = ["KEYW", "KMCI", "KMVY", "KCCR"];
    const airports = await AviationWeatherApi.fetchAirports(icaoCodes);

    //console.log(airports);

    assert.strictEqual(airports.length, icaoCodes.length);

    airports.forEach((airport) => {
      assert.ok(airport.icaoId, "airport.icaoId");
      assert.ok(icaoCodes.indexOf(airport.icaoId) > -1);
      assert.ok(airport.name, "airport.name");
      assert.ok(airport.type, "airport.type");
      assert.ok(airport.lat, "airport.lat");
      assert.ok(airport.lon, "airport.lon");
      assert.ok(airport.elev, "airport.elev");
      assert.ok(airport.magdec, "airport.magdec");
      assert.ok(airport.rwyNum, "airport.rwyNum");
      assert.ok(airport.tower, "airport.tower");
      assert.ok(airport.beacon, "airport.beacon");
      assert.ok(Array.isArray(airport.runways), "airport.runways");
      assert.ok(Array.isArray(airport.freqs) || typeof airport.freqs === "string", "airport.freqs");
    });

    console.log(`✅ ${this.constructor.name}.fetchAirports successful`);
  }

  async fetchMetar() {
    const metars = await AviationWeatherApi.fetchMetar(["KEYw"]);

    assert.strictEqual(metars.length, 1);

    console.log(`✅ ${this.constructor.name}.fetchMetar successful`);
  }
}

export class AviationWeatherApiHelpersTest {
  constructor() {
    this.fixFrequencies();
  }

  fixFrequencies() {
    {
      const expected = AviationWeatherApiHelpers.fixFrequencies("LCL/P,123.9;ATIS,124.7");

      assert.strictEqual(expected.length, 2);
      assert.strictEqual(expected[0].type, "LCL/P");
      assert.strictEqual(expected[0].freq, 123.9);
    }

    {
      const expected = AviationWeatherApiHelpers.fixFrequencies("-");

      assert.strictEqual(expected.length, 1);
      assert.strictEqual(expected[0].type, "-");
      assert.strictEqual(expected[0].freq, undefined);
    }

    {
      const expected = AviationWeatherApiHelpers.fixFrequencies([
        { type: "LCL/P", freq: 123.9 },
        { type: "ATIS", freq: 124.7 },
      ]);

      assert.strictEqual(expected.length, 2);
      assert.strictEqual(expected[0].type, "LCL/P");
      assert.strictEqual(expected[0].freq, 123.9);
    }

    console.log(`✅ ${this.constructor.name}.fixFrequencies successful`);
  }
}
