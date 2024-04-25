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
    if (!airport.length) {
      throw new Error("No airport information from API");
    }
    this.airport = new Airport(airport[0], this.cliOptions.getRightPatternRunways);
    // const navaids = await AviationWeatherApi.fetchNavaid(this.airport.position);

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
     * @param {number} length in meter
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

      output += `// -----------------------------------------------------------------------------
            <[tmmission_definition][mission][]
                <[string8][title][${s.airport.id} #${index + 1}: ${s.airport.name}]>
                <[string8][description][${s.description}]>
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
                    <[float64][wind_gusts][${s.weather?.windGusts ?? 0}]>
                    <[float64][turbulence_strength][${s.weather?.turbulenceStrength ?? 0}]>
                    <[float64][thermal_strength][${s.weather?.thermalStrength ?? 0}]>
                    <[float64][visibility][${(s.weather?.visibility ?? 15) * Units.meterPerStatuteMile}]>
                    <[float64][cloud_cover][${s.weather?.cloudCover ?? 0}]>
                    <[float64][cloud_base][${(s.weather?.cloudBase ?? 0) / Units.feetPerMeter}]>
                >
                <[list_tmmission_checkpoint][checkpoints][]
`;

      /**
       * @type {Point?}
       */
      let lastPosition = null;
      s.waypoints.forEach((waypoint, index) => {
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

  /**
   *
   * @returns {string}
   */
  buildReadmeMarkdown() {
    if (!this.airport) {
      return "";
    }

    /**
     * @param {number|string|undefined} value
     * @param {number} targetLength
     * @param {boolean} start
     * @returns {string}
     */
    const pad = (value, targetLength = 2, start = false) => {
      if (value === undefined) {
        return "";
      }
      return start ? String(value).padStart(targetLength, " ") : String(value).padEnd(targetLength, " ");
    };

    /**
     * @param {number|string} value
     * @param {number} targetLength
     * @returns {string}
     */
    const padNumber = (value, targetLength = 2) => {
      return String(value).padStart(targetLength, "0");
    };

    let output = [`# ${this.airport.name} (${this.airport.id})`, ""];

    output.push(
      `Get [more information about ${this.airport.name} airport on SkyVector](https://skyvector.com/airport/${encodeURIComponent(this.airport.id)}).`,
      "",
      "## Included missions",
      "",
    );

    output.push(`| No  |  Time | Wind          | Clouds          | Visibility | Runway  |`);
    output.push(`| :-: | ----: | ------------- | --------------- | ---------: | ------- |`);
    this.scenarios.forEach((s, index) => {
      const lst = Math.round((s.date.getUTCHours() - s.airport.lstOffset + 24) % 24);
      output.push(
        "| " +
          [
            "#" + pad(index + 1),
            padNumber(lst) + ":00",
            `${pad(s.weather?.windDirection, 3, true)}° @ ${pad(s.weather?.windSpeed, 2, true)} kts`,
            `${pad(s.weather?.cloudCoverCode, 3, true)} @ ${pad(s.weather?.cloudBase.toLocaleString("en"), 6, true)} ft`,
            pad(Math.round(s.weather?.visibility ?? 0), 7, true) + " SM",
            pad(s.activeRunway?.id + (s.activeRunway?.isRightPattern ? " (RP)" : ""), 7),
          ].join(" | ") +
          " |",
      );
    });

    output.push(
      "",
      "## Installation instructions",
      "",
      "1. Download the [`custom_missions_user.tmc`](./custom_missions_user.tmc)",
      `2. See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.`,
      "",
    );

    return output.join("\n");
  }

  async writeCustomMissionTmc() {
    const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
    const dir = `${__dirname}/../../data/${this.cliOptions.icaoCode}-${this.cliOptions.aircraft}`;

    await fs.mkdir(dir, { recursive: true });
    await Promise.all([
      fs.writeFile(`${dir}/custom_missions_user.tmc`, this.buildCustomMissionTmc()),
      fs.writeFile(`${dir}/README.md`, this.buildReadmeMarkdown()),
      fs.writeFile(
        `${dir}/${this.cliOptions.icaoCode}-${this.cliOptions.aircraft}.geojson`,
        JSON.stringify(this.buildGeoJson(), null, 2),
      ),
      // fs.writeFile(`${dir}/debug.json`, JSON.stringify(this, null, 2)),
    ]);
  }
}

export class AeroflyPatternsDescription {
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

  /**
   * Get a readable direction
   * @param {number} heading
   * @returns {string}
   */
  static getDirection(heading) {
    const headings = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
    return headings[Math.round((heading / 360) * headings.length) % headings.length];
  }

  /**
   * Get a readable direction
   * @param {number} number
   * @returns {string}
   */
  static getNumberString(number) {
    const numbers = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
    ];
    return numbers[Math.round(number)] ?? String(number);
  }

  /**
   * @param  {import('./Scenario.js').ScenarioWeather} weather
   * @returns {string}
   */
  static getWeatherAdjectives(weather) {
    /**
     * @type {string[]}
     */
    const adjectives = [];

    if (weather.windSpeed >= 20) {
      adjectives.push("stormy");
    } else if (weather.windSpeed >= 10) {
      adjectives.push("windy");
    }

    if (weather.visibility <= 1) {
      adjectives.push("foggy");
    } else if (weather.visibility <= 3) {
      adjectives.push("misty");
    } else {
      switch (weather.cloudCoverCode) {
        case "OVC":
          adjectives.push("overcast");
          break;
        case "BKN":
          adjectives.push("cloudy");
          break;
        case "CLR":
          adjectives.push("clear");
          break;
      }
    }
    return adjectives.join(", ");
  }
}
