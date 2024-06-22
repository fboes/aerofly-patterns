// @ts-check
import { Airport } from "./Airport.js";
import { AviationWeatherApi } from "./AviationWeatherApi.js";
import { Configuration } from "./Configuration.js";
import { FeatureCollection, Feature, LineString } from "@fboes/geojson";
import { Scenario } from "./Scenario.js";
import { DateYielder } from "./DateYielder.js";
import { Formatter } from "./Formatter.js";
import { LocalTime } from "./LocalTime.js";
import {
  AeroflyMission,
  AeroflyMissionConditions,
  AeroflyMissionConditionsCloud,
  AeroflyMissionsList,
} from "@fboes/aerofly-custom-missions";

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

  async build() {
    const airport = await AviationWeatherApi.fetchAirports([this.configuration.icaoCode]);
    if (!airport.length) {
      throw new Error("No airport information from API");
    }
    this.airport = new Airport(airport[0], this.configuration);

    const navaids = await AviationWeatherApi.fetchNavaid(this.airport.position, 10000);
    this.airport.setNavaids(navaids);

    const dateYielder = new DateYielder(this.configuration.numberOfMissions, this.airport.nauticalTimezone);
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
          dimension: r.dimension,
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

    if (scenario.activeRunway && scenario.entryWaypoint) {
      geoJson.addFeature(
        new Feature(
          new LineString([
            scenario.aircraft.position,
            scenario.entryWaypoint.position,
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
     * @type {AeroflyMission[]}
     */
    const missions = this.scenarios.map((s, index) => {
      const conditions = new AeroflyMissionConditions({
        time: s.date,
        wind: {
          direction: s.weather?.windDirection ?? 0,
          speed: s.weather?.windSpeed ?? 0,
          gusts: s.weather?.windGusts ?? 0,
        },
        turbulenceStrength: s.weather?.turbulenceStrength ?? 0,
        thermalStrength: s.weather?.thermalStrength ?? 0,
        visibility_sm: s.weather?.visibility ?? 15,
        clouds:
          s.weather?.clouds.map((c) => {
            return AeroflyMissionConditionsCloud.createInFeet(c.cloudCover, c.cloudBase);
          }) ?? [],
      });

      const mission = new AeroflyMission(`${s.airport.id} #${index + 1}: ${s.airport.name}`, {
        checkpoints: s.waypoints,
        description: s.description ?? "",
        flightSetting: "cruise",
        aircraft: {
          name: s.aircraft.aeroflyCode,
          livery: s.aircraft.aeroflyLiveryCode,
          icao: s.aircraft.data.icaoCode,
        },
        callsign: s.aircraft.data.callsign,
        origin: {
          icao: s.airport.id,
          longitude: s.aircraft.position.longitude,
          latitude: s.aircraft.position.latitude,
          dir: s.aircraft.heading,
          alt: s.aircraft.position.elevation ?? 0,
        },
        destination: {
          icao: s.airport.id,
          longitude: s.airport.position.longitude,
          latitude: s.airport.position.latitude,
          dir: s.activeRunway?.alignment ?? 0,
          alt: s.airport.position.elevation ?? 0,
        },
        conditions,
      });

      return mission;
    });

    return new AeroflyMissionsList(missions).toString();
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
      `| No  | Local date¹ | Local time¹ | Wind          | Clouds          | Visibility | Runway   | Aircraft position   |`,
      `| :-: | ----------- | ----------: | ------------- | --------------- | ---------: | -------- | ------------------- |`,
    );
    this.scenarios.forEach((s, index) => {
      const localNauticalTime = LocalTime(s.date, s.airport.nauticalTimezone);
      const clouds =
        s.weather?.clouds[0]?.cloudCoverCode !== "CLR"
          ? `${pad(s.weather?.clouds[0]?.cloudCoverCode, 3, true)} @ ${pad(s.weather?.clouds[0]?.cloudBase.toLocaleString("en"), 6, true)} ft`
          : pad(s.weather?.clouds[0]?.cloudCoverCode, 15);

      output.push(
        "| " +
          [
            "#" + pad(index + 1),
            pad(
              localNauticalTime.fullYear +
                "-" +
                padNumber(localNauticalTime.month + 1) +
                "-" +
                padNumber(localNauticalTime.date),
              11,
              true,
            ),
            pad(padNumber(localNauticalTime.hours) + ":" + padNumber(localNauticalTime.minutes), 11, true),
            !s.weather?.windSpeed
              ? pad("Calm", 13)
              : `${pad(s.weather?.windDirection, 3, true)}° @ ${pad(s.weather?.windSpeed, 2, true)}  kts`,
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
      "¹) Local [nautical time](https://en.wikipedia.org/wiki/Nautical_time)",
      "",
      "## Installation instructions",
      "",
      "1. Download the [`custom_missions_user.tmc`](./custom_missions_user.tmc)",
      `2. See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.`,
    );

    output.push("", `---`, ``, `Created with [Aerofly Landegerät](https://github.com/fboes/aerofly-patterns)`, ``);

    return output.join("\n");
  }
}
