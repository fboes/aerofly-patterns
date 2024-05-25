// @ts-check
import * as fs from "node:fs/promises";
import { Airport } from "./Airport.js";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
import { Configuration } from "./Configuration.js";
import { FeatureCollection, Feature, LineString } from "@fboes/geojson";
import { Scenario } from "./Scenario.js";
import { DateYielder } from "./DateYielder.js";
import { Units } from "../data/Units.js";
import { Point } from "@fboes/geojson";
import { Vector } from "@fboes/geojson";
import { Formatter } from "./Formatter.js";

/**
 * @typedef AeroflyPatternsCheckpoint
 * @type {object}
 * @property {AeroflyPatternsWaypointable} waypoint
 * @property {"origin"|"departure_runway"|"waypoint"|"destination_runway"|"destination"} type
 * @property {number} [length] optional in meters
 * @property {number} [frequency] optional in Hz
 */

/**
 * @typedef AeroflyPatternsWaypointable
 * @type {object}
 * @property {string} id
 * @property  {import('@fboes/geojson').Point} position
 */

export class AeroflyPatterns {
  /**
   *
   * @param {Configuration} configuration
   */
  constructor(configuration) {
    /**
     * @type {Configuration}
     */
    this.configuration = configuration;

    /**
     * @type {Airport?} the airport to build scenarios for
     */
    this.airport = null;

    /**
     * @type {Scenario[]} the scenarios to
     */
    this.scenarios = [];
  }

  /**
   *
   * @param {string} saveDirectory
   */
  async build(saveDirectory) {
    const airport = await AviationWeatherApi.fetchAirports([this.configuration.icaoCode]);
    if (!airport.length) {
      throw new Error("No airport information from API");
    }
    this.airport = new Airport(airport[0], this.configuration);

    const navaids = await AviationWeatherApi.fetchNavaid(this.airport.position, 10000);
    this.airport.setNavaids(navaids);

    const dateYielder = new DateYielder(this.configuration.numberOfMissions, this.airport.lstOffset);
    const dates = dateYielder.entries();
    for (const date of dates) {
      const scenario = new Scenario(this.airport, this.configuration, date);
      try {
        await scenario.build();
        this.scenarios.push(scenario);
      } catch (error) {
        console.error(error);
      }
    }

    if (this.scenarios.length === 0) {
      throw Error("No scenarios generated, possibly because of missing weather data");
    }

    await this.writeCustomMissionFiles(saveDirectory);
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
        frequency: this.airport.localFrequency,
      }),
    ]);
    this.airport.runways.forEach((r) => {
      geoJson.addFeature(
        new Feature(r.position, {
          title: r.id,
          "marker-symbol":
            r === scenario.activeRunway ? "triangle" : r.runwayType === "H" ? "heliport" : "triangle-stroked",
          alignment: r.alignment,
          frequency: r.ilsFrequency,
          isRightPattern: r.isRightPattern,
        }),
      );
    });

    this.airport.navaids.forEach((n) => {
      geoJson.addFeature(
        new Feature(n.position, {
          title: n.id,
          "marker-symbol": "communications-tower",
          frequency: n.frequency,
          type: n.type,
        }),
      );
    });

    geoJson.addFeature(
      new Feature(scenario.aircraft.position, {
        title: scenario.aircraft.data.icaoCode,
        "marker-symbol": "airfield",
      }),
    );

    const waypoints = scenario.patternWaypoints.map((p) => {
      return p.position;
    });
    waypoints.push(scenario.patternWaypoints[0].position);
    geoJson.addFeature(
      new Feature(new LineString(waypoints), {
        title: "Traffic pattern",
        "stroke-opacity": 0.2,
      }),
    );

    if (scenario.activeRunway) {
      geoJson.addFeature(
        new Feature(
          new LineString([
            scenario.aircraft.position,
            scenario.entryWaypoint?.position,
            scenario.patternWaypoints[2].position,
            scenario.patternWaypoints[3].position,
            scenario.patternWaypoints[4].position,
            scenario.activeRunway?.position,
          ]),
          {
            title: "Flight plan",
            stroke: "#ff1493",
          },
        ),
      );
    }

    scenario.patternWaypoints.forEach((p) => {
      geoJson.addFeature(
        new Feature(p.position, {
          title: p.id,
          "marker-symbol": "racetrack",
        }),
      );
    });

    return geoJson;
  }

  /**
   * @returns {string}
   */
  buildCustomMissionTmc() {
    /**
     *
     * @param {AeroflyPatternsCheckpoint} checkpoint
     * @param {number} index
     * @param {Point?} lastPosition
     * @returns {string}
     */
    const exportWaypoint = (checkpoint, index, lastPosition) => {
      /**
       * @type {Vector?}
       */
      let vector = null;
      const waypointable = checkpoint.waypoint;
      if (lastPosition) {
        vector = lastPosition.getVectorTo(waypointable.position);
      }
      return `                    <[tmmission_checkpoint][element][${index}]
                        <[string8u][type][${checkpoint.type}]>
                        <[string8u][name][${waypointable.id || "WS2037"}]>
                        <[vector2_float64][lon_lat][${waypointable.position.longitude} ${waypointable.position.latitude}]>
                        <[float64][altitude][${waypointable.position.elevation}]> // ${(waypointable.position.elevation ?? 0) * Units.feetPerMeter} ft
                        <[float64][direction][${vector?.bearing ?? -1}]>
                        <[float64][slope][0]>
                        <[float64][length][${checkpoint.length ?? 0}]>
                        <[float64][frequency][${checkpoint.frequency ?? 0}]>
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

      output += `// -----------------------------------------------------------------------------
            <[tmmission_definition][mission][]
                // Created with Aerofly Landegerät
                <[string8][title][${s.airport.id} #${index + 1}: ${s.airport.name}]>
                <[string8][description][${s.description}]>
                <[string8]   [flight_setting]     [cruise]>
                <[string8u]  [aircraft_name]      [${s.aircraft.aeroflyCode}]>
                <[stringt8c] [aircraft_icao]      [${s.aircraft.data.icaoCode}]>
                <[stringt8c] [callsign]           [${s.aircraft.data.callsign}]>
                <[stringt8c] [origin_icao]        [${s.airport.id}]>
                <[tmvector2d][origin_lon_lat]     [${s.aircraft.position.longitude} ${s.aircraft.position.latitude}]>
                <[float64]   [origin_dir]         [${s.aircraft.heading}]>
                <[float64]   [origin_alt]         [${s.aircraft.position.elevation}]> // ${(s.aircraft.position.elevation ?? 0) * Units.feetPerMeter} ft
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
        output += exportWaypoint(waypoint, index, lastPosition);
        lastPosition = waypoint.waypoint.position;
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

    const firstMission = this.scenarios[0];

    let output = [`# Landing Challenges: ${this.airport.name} (${this.airport.id})`];

    output.push(
      "",
      "This [`custom_missions_user.tmc`](./custom_missions_user.tmc) file contains random landing scenarios for Aerofly FS 4.",
      "",
      `Your ${firstMission.aircraft.data.name} is ${this.configuration.initialDistance} NM away from ${this.airport.name} Airport, and you have to make a correct landing pattern entry and land safely.`,
      "",
      "## Airport details",
    );

    const airportDescription = this.airport.getDescription(firstMission.aircraft.data.hasNoRadioNav !== true);
    if (airportDescription) {
      output.push(airportDescription);
    }

    output.push(
      "",
      `Get [more information about ${this.airport.name} Airport on SkyVector](https://skyvector.com/airport/${encodeURIComponent(this.airport.id)}):`,
      "",
      `- What is the tower / CTAF frequency?
- What is the Traffic Pattern Altitude (TPA) for this airport?
- Has the runway standard left turns, or right turns?
- Are there additional navigational aids like ILS for your assigned runways?
- Are there special noises abatement procedures in effect?`,
    );

    output.push(
      "",
      "## Included missions",
      "",
      `| No  | Local date | Local time | Wind         | Clouds          | Visibility | Runway   | Aircraft position   |`,
      `| :-: | ---------- | ---------: | ------------ | --------------- | ---------: | -------- | ------------------- |`,
    );
    this.scenarios.forEach((s, index) => {
      const lst = Math.round((s.date.getUTCHours() + s.airport.lstOffset + 24) % 24);
      const clouds =
        s.weather?.cloudCoverCode !== "CLR"
          ? `${pad(s.weather?.cloudCoverCode, 3, true)} @ ${pad(s.weather?.cloudBase.toLocaleString("en"), 6, true)} ft`
          : pad(s.weather?.cloudCoverCode, 15);

      output.push(
        "| " +
          [
            "#" + pad(index + 1),
            Formatter.getUtcCompleteDate(s.date),
            pad(padNumber(lst) + ":00", 10, true),
            s.weather?.windSpeed === 0
              ? pad("Calm", 12)
              : `${pad(s.weather?.windDirection, 3, true)}° @ ${pad(s.weather?.windSpeed, 2, true)} kn`,
            clouds,
            pad(Math.round(s.weather?.visibility ?? 0), 7, true) + " SM",
            pad(s.activeRunway?.id + (s.activeRunway?.isRightPattern ? " (RP)" : ""), 8),
            Formatter.getDirectionArrow(s.aircraft.vectorFromAirport.bearing) +
              " To the " +
              pad(Formatter.getDirection(s.aircraft.vectorFromAirport.bearing), 10),
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
    );

    output.push("", `---`, ``, `Created with [Aerofly Landegerät](https://github.com/fboes/aerofly-patterns)`, ``);

    return output.join("\n");
  }

  /**
   *
   * @param {string} saveDirectory
   */
  async writeCustomMissionFiles(saveDirectory) {
    if (this.configuration.directoryMode) {
      saveDirectory = `${saveDirectory}/data/Landing_Challenges-${this.configuration.icaoCode}-${this.configuration.aircraft}`;

      await fs.mkdir(saveDirectory, { recursive: true });
    }

    await Promise.all([
      fs.writeFile(`${saveDirectory}/custom_missions_user.tmc`, this.buildCustomMissionTmc()),
      !this.configuration.readme || fs.writeFile(`${saveDirectory}/README.md`, this.buildReadmeMarkdown()),
      !this.configuration.geojson ||
        fs.writeFile(
          `${saveDirectory}/${this.configuration.icaoCode}-${this.configuration.aircraft}.geojson`,
          JSON.stringify(this.buildGeoJson(), null, 2),
        ),
      // fs.writeFile(`${saveDirectory}/debug.json`, JSON.stringify(this, null, 2)),
    ]);
  }
}
