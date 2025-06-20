import { AeroflyMissionsList } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraft, AeroflyAircraftFinder } from "../../data/AeroflyAircraft.js";
import { DateYielder } from "../general/DateYielder.js";
import { Configuration } from "./Configuration.js";
import { Scenario } from "./Scenario.js";
import { Feature, FeatureCollection, LineString, Point } from "@fboes/geojson";
import { OpenStreetMapApi, OpenStreetMapApiAirport } from "../general/OpenStreetMapApi.js";
import { Markdown } from "../general/Markdown.js";
import { LocalTime } from "../general/LocalTime.js";

export class AeroflyAirRace {
  configuration: Configuration;
  airport: OpenStreetMapApiAirport | null = null;
  aircraft: AeroflyAircraft | null = null;
  scenarios: Scenario[] = [];
  nauticalTimezone: number = 0;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  static async init(configuration: Configuration): Promise<AeroflyAirRace> {
    const airport = await OpenStreetMapApi.search(configuration.startingLocation);
    if (!airport.length) {
      throw new Error("No location information from API");
    }

    const self = new AeroflyAirRace(configuration);
    self.airport = new OpenStreetMapApiAirport(airport[0]);
    self.nauticalTimezone = Math.round((self.airport.lon ?? 0) / 15);

    self.aircraft = AeroflyAircraftFinder.get(configuration.aircraft);

    const dateYielder = new DateYielder(self.configuration.numberOfMissions, self.nauticalTimezone);
    const dates = dateYielder.entries();
    let index = 0;
    for (const date of dates) {
      try {
        const scenario = await Scenario.init(self.configuration, self.aircraft, self.airport, date, index++);
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

  buildCustomMissionTmc(): string {
    return new AeroflyMissionsList(
      this.scenarios.map((s) => {
        return s.mission;
      }),
    ).toString();
  }

  buildReadmeMarkdown(): string {
    if (!this.airport || !this.aircraft) {
      return "";
    }

    const markdownTable = Markdown.table([
      [`No `, `Local date¹`, `Local time¹`, `        Wind`, `Clouds`, `Thermal`, `Duration`, `Flight distance`],
      [`:-:`, `-----------`, `----------:`, `-----------:`, `------`, `-------`, `-------:`, `--------------:`],
      ...this.scenarios.map((s, index): string[] => {
        const localNauticalTime = new LocalTime(s.date, this.nauticalTimezone);

        const conditions = s.mission.conditions;
        const wind = conditions.wind.speed
          ? `${Math.ceil(conditions.wind.speed)} kts @ ${conditions.wind.direction.toFixed(0).padStart(3, "0")}°`
          : "Calm";
        const clouds =
          conditions.clouds[0]?.cover_code !== "CLR"
            ? `${conditions.clouds[0]?.cover_code} @ ${conditions.clouds[0]?.base_feet.toLocaleString("en")} ft`
            : conditions.clouds[0]?.cover_code;
        const thermalStrength =
          conditions.thermalStrength > 0.8 ? "High" : conditions.thermalStrength > 0.2 ? "Medium" : "Low";

        return [
          `#${String(index + 1).padStart(2, "0")}`,
          localNauticalTime.toDateString(),
          localNauticalTime.toTimeString(),
          wind,
          clouds,
          thermalStrength,
          `${Math.ceil((s.mission.duration ?? 0) / 60)} min`,
          `${Math.ceil((s.mission.distance ?? 0) / 1000)} km`,
        ];
      }),
    ]);

    const localTime = new LocalTime(new Date(), this.nauticalTimezone);

    return `\
# Landegerät: Air Racing at ${this.airport.name}

This file contains ${this.configuration.numberOfMissions} air racing missions for the ${this.aircraft.nameFull} starting at [${this.airport.name}](https://skyvector.com/airport/${encodeURIComponent(this.airport.icaoId ?? "")}).

- See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import [the missions into Aerofly FS 4](missions/custom_missions_user.tmc) and all other files.
- See [the Aerofly FS 4 manual on challenges / missions](https://www.aerofly.com/tutorials/missions/) on how to access these missions in Aerofly FS 4.

## Included missions

There are ${this.configuration.numberOfMissions} missions included in this [custom missions file](missions/custom_missions_user.tmc).

${markdownTable}

¹) Local [nautical time](https://en.wikipedia.org/wiki/Nautical_time) with UTC${localTime.timeZone} (${localTime.nauticalZoneId})

---

Created with [Aerofly Landegerät](https://github.com/fboes/aerofly-patterns)
`;
  }

  buildGeoJson(): string {
    const geoJson = new FeatureCollection();

    const scenario = this.scenarios.at(0);
    if (scenario == undefined) {
      return "";
    }

    const colors = ["#FF1493", "#C2E812", "#91F5AD", "#F96900", "#3B429F"];

    this.scenarios.forEach((scenario, scenarioIndex) => {
      const opacity = scenarioIndex === 0 ? 1 : 0.33;

      const lastCp = scenario.mission.checkpoints.at(-1);
      if (scenarioIndex === 0) {
        scenario.mission.checkpoints.forEach((cp, index) => {
          geoJson.addFeature(
            new Feature(new Point(cp.longitude, cp.latitude, cp.altitude), {
              id: scenarioIndex * 100 + index,
              title: cp.name,
              desription: scenario.mission.title,
              "marker-symbol": index === 0 ? (scenarioIndex + 1).toString() : cp === lastCp ? "racetrack" : "triangle",
              "fill-opacity": opacity,
            }),
          );
        });
      } else if (lastCp) {
        geoJson.addFeature(
          new Feature(new Point(lastCp.longitude, lastCp.latitude, lastCp.altitude), {
            id: scenarioIndex * 100 + 1,
            title: lastCp.name,
            desription: scenario.mission.title,
            "marker-symbol": "racetrack",
            "fill-opacity": opacity,
          }),
        );
      }

      geoJson.addFeature(
        new Feature(
          new LineString(
            scenario.mission.checkpoints.map((cp): Point => {
              return new Point(cp.longitude, cp.latitude, cp.altitude);
            }),
          ),
          {
            id: scenarioIndex * 100,
            title: scenario.mission.title,
            description: `${scenario.mission.description.replace(/\n/g, "  \n")} The flight distance is ${Math.ceil((scenario.mission.distance ?? 0) / 1000)} km.`,
            stroke: colors[scenarioIndex % colors.length],
            "stroke-opacity": opacity,
          },
        ),
      );
    });

    return JSON.stringify(geoJson, null, 2);
  }
}
