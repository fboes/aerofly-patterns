import { Airport } from "./Airport.js";
import { AviationWeatherApi } from "../general/AviationWeatherApi.js";
import { Configuration } from "./Configuration.js";
import { FeatureCollection, Feature, LineString, Point } from "@fboes/geojson";
import { Scenario } from "./Scenario.js";
import { DateYielder } from "../general/DateYielder.js";
import { Formatter } from "../general/Formatter.js";
import { LocalTime } from "../general/LocalTime.js";
import {
  AeroflyMission,
  AeroflyMissionConditions,
  AeroflyMissionConditionsCloud,
  AeroflyMissionsList,
  AeroflyMissionTargetPlane,
} from "@fboes/aerofly-custom-missions";
import { Vector } from "@fboes/geojson";
import { Markdown } from "../general/Markdown.js";

export interface AeroflyPatternsWaypointable {
  id: string;
  position: Point;
}

export class AeroflyPatterns {
  configuration: Configuration;
  airport: Airport | null;
  scenarios: Scenario[];

  constructor(configuration: Configuration) {
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

  static async init(configuration: Configuration): Promise<AeroflyPatterns> {
    const self = new AeroflyPatterns(configuration);

    const airport = await AviationWeatherApi.fetchAirports([self.configuration.icaoCode]);
    if (!airport.length) {
      throw new Error("No airport information from API");
    }
    self.airport = new Airport(airport[0], self.configuration);

    const navaids = await AviationWeatherApi.fetchNavaid(self.airport.position, 10000);
    self.airport.setNavaids(navaids);

    const dateYielder = new DateYielder(self.configuration.numberOfMissions, self.airport.nauticalTimezone);
    const dates = dateYielder.entries();
    for (const date of dates) {
      try {
        const scenario = await Scenario.init(self.airport, self.configuration, date);
        self.scenarios.push(scenario);
      } catch (error) {
        console.error(error);
      }
    }

    if (self.scenarios.length === 0) {
      throw Error("No scenarios generated, possibly because of missing weather data");
    }

    return self;
  }

  buildGeoJson(): FeatureCollection | null {
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

  buildCustomMissionTmc(): string {
    /**
     * @type {AeroflyMission[]}
     */
    const missions: AeroflyMission[] = this.scenarios.map((s, index) => {
      const conditions = new AeroflyMissionConditions({
        time: s.date,
        wind: {
          direction: s.weather?.windDirection ?? 0,
          speed: s.weather?.windSpeed ?? 0,
          gusts: s.weather?.windGusts ?? 0,
        },
        turbulenceStrength: s.weather?.turbulenceStrength ?? 0,
        visibility_sm: s.weather?.visibility ?? 15,
        clouds:
          s.weather?.clouds.map((c) => {
            return AeroflyMissionConditionsCloud.createInFeet(c.cloudCover, c.cloudBase);
          }) ?? [],
      });
      conditions.temperature = s.weather?.temperature ?? 0;

      const mission = new AeroflyMission(`${s.airport.id} #${index + 1}: ${s.airport.name}`, {
        checkpoints: s.waypoints,
        description: s.description ?? "",
        tags: s.tags,
        flightSetting: "cruise",
        difficulty: 0.5 + index * 0.01,
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

      if (this.configuration.noGuides) {
        const targetPosition = s.aircraft.position.getPointBy(new Vector(1, s.aircraft.heading));
        mission.finish = new AeroflyMissionTargetPlane(
          targetPosition.longitude,
          targetPosition.latitude,
          s.aircraft.heading,
        );
      }

      return mission;
    });

    return new AeroflyMissionsList(missions).toString();
  }

  buildReadmeMarkdown(): string {
    if (!this.airport) {
      return "";
    }

    const firstMission = this.scenarios[0];
    const markdownTable = Markdown.table([
      [`No `, `Local date¹`, `Local time¹`, `Wind`, `Clouds`, `Visibility`, `Runway`, `Aircraft position`],
      [`:-:`, `-----------`, `----------:`, `----`, `------`, `---------:`, `------`, `-----------------`],
      ...this.scenarios.map((s, index) => {
        const localNauticalTime = new LocalTime(s.date, s.airport.nauticalTimezone);
        const clouds =
          s.weather?.clouds[0]?.cloudCoverCode !== "CLR"
            ? `${s.weather?.clouds[0]?.cloudCoverCode} @ ${s.weather?.clouds[0]?.cloudBase.toLocaleString("en")} ft`
            : s.weather?.clouds[0]?.cloudCoverCode;

        return [
          `#${String(index + 1).padStart(2, "0")}`,
          localNauticalTime.toDateString(),
          localNauticalTime.toTimeString(),
          !s.weather?.windSpeed ? "Calm" : `${s.weather?.windDirection}° @ ${s.weather?.windSpeed} kts`,
          clouds,
          Math.round(s.weather?.visibility ?? 0) + " SM",
          s.activeRunway?.id + (s.activeRunway?.isRightPattern ? " (RP)" : ""),
          Formatter.getDirectionArrow(s.aircraft.vectorFromAirport.bearing) +
            " To the " +
            Formatter.getDirection(s.aircraft.vectorFromAirport.bearing),
        ];
      }),
    ]);
    const airportDescription = this.airport.getDescription(firstMission.aircraft.data.hasNoRadioNav !== true);

    return `\
# Landing Challenges: ${this.airport.name} (${this.airport.id})

This [\`custom_missions_user.tmc\`](missions/custom_missions_user.tmc) file contains random landing scenarios for Aerofly FS 4.

Your ${firstMission.aircraft.data.nameFull} is ${this.configuration.initialDistance} NM away from ${this.airport.name} Airport, and you have to make a correct landing pattern or instrument approach procedure entry and land safely.

## Airport details

${airportDescription.trim()}

Get [more information about ${this.airport.name} Airport on SkyVector](https://skyvector.com/airport/${encodeURIComponent(this.airport.id)}):

- What is the tower / CTAF frequency?
- What is the Traffic Pattern Altitude (TPA) for this airport?
- Has the runway standard left turns, or right turns?
- Are there additional navigational aids like ILS for your assigned runways?
- Are there special noise abatement procedures in effect?

## Included missions

${markdownTable}

¹) Local [nautical time](https://en.wikipedia.org/wiki/Nautical_time)

## Installation instructions

1. Download the [\`custom_missions_user.tmc\`](missions/custom_missions_user.tmc)
2. See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import the missions into Aerofly FS 4.

---

Created with [Aerofly Landegerät](https://github.com/fboes/aerofly-patterns)
`;
  }
}
