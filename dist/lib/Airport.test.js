//@ts-check

import { strict as assert } from "node:assert";
import { Airport } from "./Airport.js";

export class AirportTest {
  constructor() {
    this.checkKansasCity();
    this.checkMarthasVineyard();
    this.checkStockton();
  }

  checkKansasCity() {
    /** @type {import('./AviationWeatherApi.js').AviationWeatherApiAirport} */
    const airportJson = {
      icaoId: "KMCI",
      name: "KANSAS CITY/KANSAS_CITY_INTL",
      type: "ARP",
      lat: 39.2976,
      lon: -94.7139,
      elev: 313.1,
      magdec: "02E",
      rwyNum: 3,
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
      icaoId: "KMVY",
      name: "VINEYARD HAVEN/MARTHA'S_VINEYARD",
      type: "ARP",
      lat: 41.3934,
      lon: -70.6139,
      elev: 20.4,
      magdec: "15W",
      rwyNum: 2,
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

  checkStockton() {
    /** @type {import('./AviationWeatherApi.js').AviationWeatherApiAirport} */
    const airportJson = {
      icaoId: "KSCK",
      name: "STOCKTON/STOCKTON_METRO",
      type: "ARP",
      lat: 37.8944,
      lon: -121.2387,
      elev: 10.1,
      magdec: "14E",
      rwyNum: 3,
      tower: "T",
      beacon: "B",
      runways: [
        {
          id: "11L/29R",
          dimension: "10249x150",
          surface: "A",
          alignment: "128",
        },
        {
          id: "11R/29L",
          dimension: "4448x75",
          surface: "A",
          alignment: "128",
        },
        {
          id: "H1",
          dimension: "70x70",
          surface: "C",
          alignment: "-",
        },
      ],
      freqs: [
        {
          type: "ATIS",
          freq: 118.25,
        },
        {
          type: "LCL/P",
          freq: 120.3,
        },
      ],
    };

    const airport = new Airport(airportJson);
    assert.strictEqual(airport.id, "KSCK");
    assert.strictEqual(airport.hasTower, true);
    assert.strictEqual(airport.hasBeacon, true);

    assert.strictEqual(airport.runways.length, 5);
    assert.strictEqual(airport.runways[0].id, "11L");
    assert.strictEqual(airport.runways[0].isRightPattern, false);
    assert.strictEqual(airport.runways[2].id, "11R");
    assert.strictEqual(airport.runways[2].isRightPattern, true);
    assert.strictEqual(airport.runways[4].runwayType, "H");

    console.log(`✅ ${this.constructor.name}.checkStockton successful`);
  }
}
