//@ts-check

import { strict as assert } from "node:assert";
import { Formatter } from "./Formatter.js";
import { ScenarioWeather } from "./Scenario.js";

export class FormatterTest {
  constructor() {
    this.getLocalDaytime();
    this.getDirection();
    this.getNumberString();
    this.getWeatherAdjectives();
    this.getUtcCompleteDate();
  }

  getLocalDaytime() {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));

    assert.strictEqual("noon", Formatter.getLocalDaytime(startDate, 0));
    assert.strictEqual("night", Formatter.getLocalDaytime(startDate, 12));
    assert.strictEqual("late afternoon", Formatter.getLocalDaytime(startDate, 5));
    console.log(`✅ ${this.constructor.name}.getLocalDaytime successful`);
  }

  getDirection() {
    assert.strictEqual("north", Formatter.getDirection(0));
    assert.strictEqual("north", Formatter.getDirection(10));
    assert.strictEqual("north", Formatter.getDirection(22));
    assert.strictEqual("north-east", Formatter.getDirection(23));
    assert.strictEqual("north-east", Formatter.getDirection(24));
    assert.strictEqual("north-east", Formatter.getDirection(45));
    assert.strictEqual("north-east", Formatter.getDirection(46));
    assert.strictEqual("east", Formatter.getDirection(90));
    assert.strictEqual("north", Formatter.getDirection(359));
    console.log(`✅ ${this.constructor.name}.getDirection successful`);
  }

  getNumberString() {
    assert.strictEqual("zero", Formatter.getNumberString(0));
    assert.strictEqual("ten", Formatter.getNumberString(10));
    assert.strictEqual("ten", Formatter.getNumberString(9.9));
    assert.strictEqual("ten", Formatter.getNumberString(10.1));
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
    assert.strictEqual("", Formatter.getWeatherAdjectives(w));

    w.visibility = 4;
    assert.strictEqual("", Formatter.getWeatherAdjectives(w));

    w.visibility = 3;
    assert.strictEqual("misty", Formatter.getWeatherAdjectives(w));

    w.visibility = 1;
    assert.strictEqual("foggy", Formatter.getWeatherAdjectives(w));

    w.cloudCoverCode = "OVC";
    assert.strictEqual("foggy", Formatter.getWeatherAdjectives(w));

    w.visibility = 4;
    assert.strictEqual("overcast", Formatter.getWeatherAdjectives(w));

    console.log(`✅ ${this.constructor.name}.getWeatherAdjectives successful`);
  }

  getUtcCompleteDate() {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));
    assert.strictEqual("2024-05-15", Formatter.getUtcCompleteDate(startDate));

    console.log(`✅ ${this.constructor.name}.getUtcCompleteDate successful`);
  }
}
