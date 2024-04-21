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
import { Point } from "@fboes/geojson";
import { Vector } from "@fboes/geojson";

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
    const airport = await AviationWeatherApi.fetchAirports([this.cliOptions.icaoCode]);
    this.buildAirport(airport);

    if (!this.airport) {
      throw Error("No airport found");
    }
    //const navaids = await AviationWeatherApi.fetchNavaid(this.airport?.position)

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
   * @param {import('./AviationWeatherApi.js').AviationWeatherApiAirport[]} airports
   */
  buildAirport(airports) {
    this.airport = new Airport(airports[0], this.cliOptions.getRightPatternRunways);
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
          "marker-symbol": r === scenario.activeRunway ? "triangle" : "triangle-stroked",
        }),
      );
    });

    geoJson.addFeature(
      new Feature(scenario.aircraft.position, {
        title: scenario.aircraft.icaoCode,
        "marker-symbol": "airfield",
      }),
    );

    if (scenario.patternEntryPoint) {
      geoJson.addFeature(
        new Feature(scenario.patternEntryPoint.position, {
          title: scenario.patternEntryPoint.id,
          "marker-symbol": "racetrack",
        }),
      );
    }

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
     * @param {Point?} lastPosition
     * @param {number} length
     * @param {number} frequency
     * @returns {string}
     */
    const exportWaypoint = (waypointable, index, type, lastPosition, length = 0, frequency = 0) => {
      /**
       * @type {Vector?}
       */
      let vector = null;
      if (lastPosition) {
        vector = lastPosition.getVectorTo(waypointable.position);
      }
      return `                    <[tmmission_checkpoint][element][${index}]
                        <[string8u][type][${type}]>
                        <[string8u][name][${waypointable.id || "WS2037"}]>
                        <[vector2_float64][lon_lat][${waypointable.position.longitude} ${waypointable.position.latitude}]>
                        <[float64][altitude][${waypointable.position.elevation}]>
                        <[float64][direction][${vector?.bearing ?? -1}]>
                        <[float64][slope][0]>
                        <[float64][length][${length}]>
                        <[float64][frequency][${frequency}]>
                    >
`;
    };

    let output = `<[file][][]
    <[tmmissions_list][][]
        <[list_tmmission_definition][missions][]

`;

    this.scenarios.forEach((s, index) => {
      if (!s.activeRunway || !s.patternEntryPoint) {
        return;
      }

      const description = `It is ${AeroflyPatternsDescription.getLocalDaytime(s.date, s.airport.lstOffset)}, and you are ${s.aircraft.distanceFromAirport} NM away from ${s.airport.name} (${s.airport.id}). As the wind is ${s.weather?.windSpeed ?? 0} kts from ${s.weather?.windDirection ?? 0}°, the currently active runway ${s.activeRunway.id}. Fly the pattern and land safely.`;
      output += `// -----------------------------------------------------------------------------
            <[tmmission_definition][mission][]
                <[string8][title][${s.airport.id} #${index + 1}: ${s.airport.name}]>
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
                <[list_tmmission_checkpoint][checkpoints][]
`;
      /**
       * @type {[AeroflyPatternsWaypointable, string, number?, number?][]}
       */
      const waypoints = [
        [s.airport, "origin"],
        [s.activeRunway, "departure_runway", s.activeRunway.dimension[0]],
        [s.patternEntryPoint, "waypoint"],
        [s.activeRunway, "destination_runway", s.activeRunway.dimension[0]],
        [s.airport, "destination"],
      ];

      /**
       * @type {Point?}
       */
      let lastPosition = null;
      waypoints.forEach((waypoint, index) => {
        output += exportWaypoint(waypoint[0], index, waypoint[1], lastPosition, waypoint[2] ?? 0, waypoint[3] ?? 0);
        lastPosition = waypoint[0].position;
      });

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
    const dir = `${__dirname}/../../data/${this.cliOptions.icaoCode}-${this.cliOptions.aircraft}`;

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/custom_missions_user.tmc`, this.buildCustomMissionTmc());
    await fs.writeFile(`${dir}/debug.json`, JSON.stringify(this, null, 2));
    await fs.writeFile(
      `${dir}/${this.cliOptions.icaoCode}-${this.cliOptions.aircraft}.geojson`,
      JSON.stringify(this.buildGeoJson(), null, 2),
    );
  }
}

class AeroflyPatternsDescription {
  /**
   *
   * @param {Date} date
   * @param {number} offset
   * @returns {string}
   */
  static getLocalDaytime(date, offset) {
    const localSolarTime = (date.getUTCHours() - offset + 24) % 24;

    if (localSolarTime < 5 || localSolarTime >= 19) {
      return "night";
    }
    if (localSolarTime < 8) {
      return "early morning";
    }
    if (localSolarTime < 11) {
      return "morning";
    }
    if (localSolarTime < 13) {
      return "noon";
    }
    if (localSolarTime < 15) {
      return "afternoon";
    }
    if (localSolarTime < 19) {
      return "late afternoon";
    }

    return "day";
  }
}
