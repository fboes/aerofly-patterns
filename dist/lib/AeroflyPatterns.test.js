//@ts-check

import { strict as assert } from "node:assert";
import { AeroflyPatternsDescription } from "./AeroflyPatterns.js";
import { ScenarioWeather } from "./Scenario.js";

export class AeroflyPatternsTest {
  constructor() {
    this.getLocalDaytime();
    this.getDirection();
    this.getNumberString();
    this.getWeatherAdjectives();
  }

  getLocalDaytime() {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));

    assert.strictEqual("noon", AeroflyPatternsDescription.getLocalDaytime(startDate, 0));
    assert.strictEqual("night", AeroflyPatternsDescription.getLocalDaytime(startDate, 12));
    assert.strictEqual("early morning", AeroflyPatternsDescription.getLocalDaytime(startDate, 5));
    console.log(`✅ ${this.constructor.name}.getLocalDaytime successful`);
  }

  getDirection() {
    assert.strictEqual("north", AeroflyPatternsDescription.getDirection(0));
    assert.strictEqual("north", AeroflyPatternsDescription.getDirection(10));
    assert.strictEqual("north", AeroflyPatternsDescription.getDirection(22));
    assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(23));
    assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(24));
    assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(45));
    assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(46));
    assert.strictEqual("east", AeroflyPatternsDescription.getDirection(90));
    assert.strictEqual("north", AeroflyPatternsDescription.getDirection(359));
    console.log(`✅ ${this.constructor.name}.getDirection successful`);
  }

  getNumberString() {
    assert.strictEqual("zero", AeroflyPatternsDescription.getNumberString(0));
    assert.strictEqual("ten", AeroflyPatternsDescription.getNumberString(10));
    assert.strictEqual("ten", AeroflyPatternsDescription.getNumberString(9.9));
    assert.strictEqual("ten", AeroflyPatternsDescription.getNumberString(10.1));
    console.log(`✅ ${this.constructor.name}.getNumberString successful`);
  }

  getWeatherAdjectives() {
    /**
     * @type {import('./AviationWeatherApi.js').AviationWeatherApiMetar}
     */
    const x = {
      icaoId: "",
      reportTime: "",
      temp: 0,
      dewp: 0,
      wdir: 0,
      wspd: 0,
      wgst: null,
      visib: "",
      altim: 0,
      lat: 0,
      lon: 0,
      elev: 0,
      clouds: [],
    };
    const w = new ScenarioWeather(x);
    assert.strictEqual("", AeroflyPatternsDescription.getWeatherAdjectives(w));

    w.visibility = 4;
    assert.strictEqual("", AeroflyPatternsDescription.getWeatherAdjectives(w));

    w.visibility = 3;
    assert.strictEqual("misty", AeroflyPatternsDescription.getWeatherAdjectives(w));

    w.visibility = 1;
    assert.strictEqual("foggy", AeroflyPatternsDescription.getWeatherAdjectives(w));

    w.cloudCoverCode = "OVC";
    assert.strictEqual("foggy", AeroflyPatternsDescription.getWeatherAdjectives(w));

    w.visibility = 4;
    assert.strictEqual("overcast", AeroflyPatternsDescription.getWeatherAdjectives(w));

    console.log(`✅ ${this.constructor.name}.getWeatherAdjectives successful`);
  }
}
