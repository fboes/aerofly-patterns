// @ts-check
import { Airport } from "./Airport.js";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
import { CliOptions } from "./CliOptions.js";
import { FeatureCollection, Feature } from "@fboes/geojson";
import { Scenario } from "./Scenario.js";
import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DateYielder } from "./DateYielder.js";
import { Units } from "./Units.js";

/**
 * @typedef {object} AeroflyPatternsWaypointable
 * @property {string} id
 * @property  {import('@fboes/geojson').Point} position
 */
export class AeroflyPatterns {
  /**
   *
   * @param {string[]} argv
   */
  constructor(argv) {
    /**
     * @type {CliOptions}
     */
    this.cliOptions = new CliOptions(argv);

    /**
     * @type {Airport?} the airport to build scenarios for
     */
    this.airport = null;

    /**
     * @type {Scenario[]} the scenarios to
     */
    this.scenarios = [];
  }

  async build() {
    const airport = await this.fetchAirports();
    this.buildAirport(airport);

    if (!this.airport) {
      throw Error("No airport found");
    }

    const dateYielder = new DateYielder(this.cliOptions.numberOfMissions, this.airport.lstOffset);
    const dates = dateYielder.entries();
    for (const date of dates) {
      const scenario = new Scenario(this.airport, this.cliOptions, date);
      await scenario.build();
      this.scenarios.push(scenario);
    }

    await this.writeCustomMissionTmc();
  }

  /**
   *
   * @returns {Promise<import('./AviationWeatherApi.js').AviationWeatherApiAirport[]>}
   */
  async fetchAirports() {
    return AviationWeatherApi.fetchAirports([this.cliOptions.icaoCode]);
  }

  /**
   *
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiAirport[]} airports
   */
  buildAirport(airports) {
    this.airport = new Airport(airports[0]);
  }

  /**
   *
   * @returns {?FeatureCollection}
   */
  buildGeoJson() {
    if (!this.airport) {
      return null;
    }
    const scenario = this.scenarios[0];

    const geoJson = new FeatureCollection([
      new Feature(this.airport.position, {
        title: this.airport.name,
        "marker-symbol": "airport",
      }),
    ]);
    this.airport.runways.forEach((r) => {
      geoJson.addFeature(
        new Feature(r.position, {
          title: r.id,
          "marker-symbol": r === scenario.activeRunway ? "racetrack" : "triangle-stroked",
        }),
      );
    });

    geoJson.addFeature(
      new Feature(scenario.aircraft.position, {
        title: scenario.aircraft.icaoCode,
        "marker-symbol": "airfield",
      }),
    );

    return geoJson;
  }

  /**
   * @returns {string}
   */
  buildCustomMissionTmc() {
    /**
     *
     * @param {AeroflyPatternsWaypointable} waypointable
     * @param {number} index
     * @param {string} type
     * @returns {string}
     */
    const exportWaypoint = (waypointable, index, type) => {
      return `                    <[tmmission_checkpoint][element][${index}]
                        <[string8u][type][${type}]>
                        <[string8u][name][${waypointable.id || "WS2037"}]>
                        <[vector2_float64][lon_lat][${waypointable.position.longitude} ${waypointable.position.latitude}]>
                        <[float64][altitude][${waypointable.position.elevation}]>
                        <[float64][direction][${index === 0 ? -1 : 0}]>
                        <[float64][slope][0]>
                        <[float64][length][${type.match(/runway/) ? 1000 : 0}]>
                        <[float64][frequency][0]>
                    >
`;
    };

    let output = `<[file][][]
    <[tmmissions_list][][]
        <[list_tmmission_definition][missions][]

`;

    this.scenarios.forEach((s, index) => {
      if (!s.activeRunway) {
        return;
      }

      const description = `${s.airport.name} (${s.airport.id}), active runway ${s.activeRunway.id}. Wind is ${s.weather?.windSpeed ?? 0} kts from ${s.weather?.windDirection ?? 0}°.`;
      output += `// -----------------------------------------------------------------------------
            <[tmmission_definition][mission][]
                <[string8][title][Landing Challenge ${s.airport.name} ${index + 1}]>
                <[string8][description][${description}]>
                <[string8]   [flight_setting]     [cruise]>
                <[string8u]  [aircraft_name]      [${s.aircraft.aeroflyCode}]>
                <[stringt8c] [aircraft_icao]      [${s.aircraft.icaoCode}]>
                <[stringt8c] [callsign]           [${s.aircraft.callsign}]>
                <[stringt8c] [origin_icao]        [${s.airport.id}]>
                <[tmvector2d][origin_lon_lat]     [${s.aircraft.position.longitude} ${s.aircraft.position.latitude}]>
                <[float64]   [origin_dir]         [${(s.aircraft.bearingFromAirport + 180) % 360}]>
                <[float64]   [origin_alt]         [${s.aircraft.position.elevation}]>
                <[stringt8c] [destination_icao]   [${s.airport.id}]>
                <[tmvector2d][destination_lon_lat][${s.airport.position.longitude} ${s.airport.position.latitude}]>
                <[float64]   [destination_dir]    [${s.activeRunway.alignment}]>
                <[tmmission_conditions][conditions][]
                    <[tm_time_utc][time][]
                        <[int32][time_year][${s.date.getUTCFullYear()}]>
                        <[int32][time_month][${s.date.getUTCMonth() + 1}]>
                        <[int32][time_day][${s.date.getUTCDate()}]>
                        <[float64][time_hours][${s.date.getUTCHours() + s.date.getMinutes() / 60}]>
                    >
                    <[float64][wind_direction][${s.weather?.windDirection ?? 0}]>
                    <[float64][wind_speed][${s.weather?.windSpeed ?? 0}]>
                    <[float64][wind_gusts][${s.weather?.wundGusts ?? 0}]>
                    <[float64][turbulence_strength][${s.weather?.turbulenceStrength ?? 0}]>
                    <[float64][thermal_strength][${s.weather?.thermalStrength ?? 0}]>
                    <[float64][visibility][${(s.weather?.visibility ?? 15) * Units.meterPerNauticalMile}]>
                    <[float64][cloud_cover][${s.weather?.cloudCover ?? 0}]>
                    <[float64][cloud_base][${(s.weather?.cloudBase ?? 0) * Units.feetPerMeter}]>
                >
`;
      let i = 0;
      output += exportWaypoint(s.airport, i++, "origin");
      output += exportWaypoint(s.activeRunway, i++, "departure_runway");
      output += exportWaypoint(s.aircraft, i++, "waypoint");
      output += exportWaypoint(s.activeRunway, i++, "destination_runway");
      output += exportWaypoint(s.airport, i, "destination");
      output += `                >
            >

`;
    });

    output += `        >
    >
>
`;

    return output;
  }

  async writeCustomMissionTmc() {
    const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
    const dir = __dirname + "/../../data";

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      `${dir}/${this.cliOptions.icaoCode}-${this.cliOptions.aircraft}.tmc`,
      this.buildCustomMissionTmc(),
    );
  }
}
