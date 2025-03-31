import { strict as assert } from "node:assert";
import { AviationWeatherApi, AviationWeatherNormalizedAirport } from "./AviationWeatherApi.js";

export class AviationWeatherApiTest {
  static async init() {
    const self = new AviationWeatherApiTest();
    await self.fetchAirports();
    await self.fetchMetar();
  }

  async fetchAirports() {
    const icaoCodes = ["KEYW", "KMCI", "KMVY", "KCCR"];
    const airports = await AviationWeatherApi.fetchAirports(icaoCodes);

    //console.log(airports);

    assert.strictEqual(airports.length, icaoCodes.length);

    airports.forEach((airport) => {
      assert.strictEqual(typeof airport.icaoId, "string", "airport.icaoId");
      assert.ok(icaoCodes.indexOf(airport.icaoId) > -1);
      assert.strictEqual(typeof airport.name, "string", "airport.name");
      assert.strictEqual(typeof airport.type, "string", "airport.type");
      assert.strictEqual(typeof airport.lat, "number", "airport.lat");
      assert.strictEqual(typeof airport.lon, "number", "airport.lon");
      assert.strictEqual(typeof airport.elev, "number", "airport.elev");
      assert.strictEqual(typeof airport.magdec, "string", "airport.magdec");
      assert.strictEqual(typeof airport.rwyNum, "string", "airport.rwyNum");
      assert.strictEqual(typeof airport.tower, "string", "airport.tower");
      assert.strictEqual(typeof airport.beacon, "string", "airport.beacon");
      assert.ok(Array.isArray(airport.runways), "airport.runways");
      assert.ok(Array.isArray(airport.freqs) || typeof airport.freqs === "string", "airport.freqs");

      const airportNormalized = new AviationWeatherNormalizedAirport(airport);
      assert.strictEqual(typeof airportNormalized.icaoId, "string", "airportNormalized.icaoId");
      assert.ok(icaoCodes.indexOf(airportNormalized.icaoId) > -1);
      assert.strictEqual(typeof airportNormalized.name, "string", "airportNormalized.name");
      assert.strictEqual(typeof airportNormalized.type, "string", "airportNormalized.type");
      assert.strictEqual(typeof airportNormalized.lat, "number", "airportNormalized.lat");
      assert.strictEqual(typeof airportNormalized.lon, "number", "airportNormalized.lon");
      assert.strictEqual(typeof airportNormalized.elev, "number", "airportNormalized.elev");
      assert.strictEqual(typeof airportNormalized.magdec, "number", "airportNormalized.magdec");
      assert.strictEqual(typeof airportNormalized.rwyNum, "number", "airportNormalized.rwyNum");
      assert.strictEqual(typeof airportNormalized.tower, "boolean", "airportNormalized.tower");
      assert.strictEqual(typeof airportNormalized.beacon, "boolean", "airportNormalized.beacon");
      assert.ok(Array.isArray(airportNormalized.runways), "airportNormalized.runways");
      assert.ok(Array.isArray(airportNormalized.freqs), "airportNormalized.freqs");
    });

    console.log(`✅ ${this.constructor.name}.fetchAirports successful`);
  }

  async fetchMetar() {
    const metars = await AviationWeatherApi.fetchMetar(["KEYw"]);

    assert.strictEqual(metars.length, 1);

    metars.forEach((metar) => {
      assert.strictEqual(typeof metar.lat, "number", "metar.lat");
      assert.strictEqual(typeof metar.lon, "number", "metar.lon");
      assert.strictEqual(typeof metar.elev, "number", "metar.elev");
    });

    console.log(`✅ ${this.constructor.name}.fetchMetar successful`);
  }
}
