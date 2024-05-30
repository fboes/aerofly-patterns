// @ts-check

import { strict as assert } from "node:assert";
import { AviationWeatherApi } from "./AviationWeatherApi.js";

export class AviationWeatherApiTest {
  constructor() {
    this.fetchAirports();
    this.fetchMetar();
  }

  async fetchAirports() {
    const airports = await AviationWeatherApi.fetchAirports(["KEYw"]);

    assert.strictEqual(airports.length, 1);

    console.log(`✅ ${this.constructor.name}.fetchAirports successful`);
  }

  async fetchMetar() {
    const metars = await AviationWeatherApi.fetchMetar(["KEYw"]);

    assert.strictEqual(metars.length, 1);

    console.log(`✅ ${this.constructor.name}.fetchMetar successful`);
  }
}
