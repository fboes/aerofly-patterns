//@ts-check

import { strict as assert } from "node:assert";
import { Airport } from "./Airport.js";

export class AirportTest {
  constructor() {
    this.checkKansasCity();
    this.checkMarthasVineyard();
  }

  checkKansasCity() {
    /** @type {import('./AviationWeatherApi.js').AviationWeatherApiAirport} */
    const airportJson = {
      id: "KMCI",
      name: "KANSAS CITY/KANSAS_CITY_INTL",
      lat: 39.2976,
      lon: -94.7139,
      elev: 313.1,
      mag_dec: "02E",
      rwy_num: 3,
      tower: "T",
      beacon: "B",
      runways: [
        {
          id: "01L/19R",
          dimension: "10801x150",
          surface: "A",
          alignment: "013",
        },
        {
          id: "01R/19L",
          dimension: "9500x150",
          surface: "C",
          alignment: "013",
        },
        {
          id: "09/27",
          dimension: "9501x150",
          surface: "A",
          alignment: "096",
        },
      ],
      freqs: [
        {
          type: "LCL/P",
          freq: 128.2,
        },
        {
          type: "D-ATIS",
          freq: 128.375,
        },
      ],
    };
    const airport = new Airport(airportJson);

    assert.strictEqual(airport.id, "KMCI");
    assert.strictEqual(airport.name, "Kansas City International");
    assert.strictEqual(airport.hasTower, true);
    assert.strictEqual(airport.hasBeacon, true);
    assert.strictEqual(airport.magneticDeclination, 2);
    assert.strictEqual(airport.runways.length, 6);
    assert.strictEqual(airport.localFrequency, 128.2);
    assert.strictEqual(airport.position.latitude, 39.2976);
    assert.strictEqual(airport.position.longitude, -94.7139);
    assert.strictEqual(airport.position.elevation, 313.1);

    console.log(`✅ ${this.constructor.name}.checkKansasCity successful`);
  }

  checkMarthasVineyard() {
    /** @type {import('./AviationWeatherApi.js').AviationWeatherApiAirport} */
    const airportJson = {
      id: "KMVY",
      name: "VINEYARD HAVEN/MARTHA'S_VINEYARD",
      lat: 41.3934,
      lon: -70.6139,
      elev: 20.4,
      mag_dec: "15W",
      rwy_num: 2,
      tower: "T",
      beacon: "B",
      runways: [
        {
          id: "06/24",
          dimension: "5504x100",
          surface: "A",
          alignment: "041",
        },
        {
          id: "15/33",
          dimension: "3327x75",
          surface: "A",
          alignment: "131",
        },
      ],
      freqs: [
        { type: "LCL/P", freq: 121.4 },
        { type: "ATIS", freq: 126.25 },
      ],
    };

    const airport = new Airport(airportJson);
    assert.strictEqual(airport.id, "KMVY");
    assert.strictEqual(airport.name, "Vineyard Haven / Martha's Vineyard");
    assert.strictEqual(airport.hasTower, true);
    assert.strictEqual(airport.hasBeacon, true);
    assert.strictEqual(airport.magneticDeclination, -15);
    assert.strictEqual(airport.runways.length, 4);
    assert.strictEqual(airport.localFrequency, 121.4);

    console.log(`✅ ${this.constructor.name}.checkMarthasVineyard successful`);
  }
}
