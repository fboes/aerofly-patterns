import { Feature, FeatureCollection, LineString, Point } from "@fboes/geojson";
import { AeroflyAircraft, AeroflyAircraftFinder } from "../../data/AeroflyAircraft.js";
import { AviationWeatherApi } from "../general/AviationWeatherApi.js";
import { DateYielder } from "../general/DateYielder.js";
import { Configuration } from "./Configuration.js";
import { Scenario } from "./Scenario.js";
import { LocalTime } from "../general/LocalTime.js";
import { AeroflyMissionsList } from "@fboes/aerofly-custom-missions";
import { Markdown } from "../general/Markdown.js";
import { Formatter } from "../general/Formatter.js";
import { HoldingPatternFix } from "./HoldingPatternFix.js";

export class AeroflyHolding {
  scenarios: Scenario[];
  nauticalTimezone: number;
  aircraft: AeroflyAircraft;
  holdingFix: HoldingPatternFix | null = null;

  static async init(configuration: Configuration): Promise<AeroflyHolding> {
    const self = new AeroflyHolding(configuration);
    self.holdingFix = await self.getHoldingFix(self.configuration.navaidCode);
    self.nauticalTimezone = Math.round((self.holdingFix.position.longitude ?? 0) / 15);

    const dateYielder = new DateYielder(self.configuration.numberOfMissions, self.nauticalTimezone);
    const dates = dateYielder.entries();
    let index = 0;
    for (const date of dates) {
      try {
        const scenario = await Scenario.init(self.holdingFix, self.configuration, self.aircraft, date, index++);
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

  private constructor(public readonly configuration: Configuration) {
    this.scenarios = [];

    /**
     * @type {number} a time zone which only considers the longitude, rounded to the full hour, in hours difference to UTC
     * @see https://en.wikipedia.org/wiki/Nautical_time
     */
    this.nauticalTimezone = 0;

    /**
     * @type {AeroflyAircraft} additional aircraft information like name and technical properties
     */
    this.aircraft = AeroflyAircraftFinder.get(this.configuration.aircraft);
  }

  buildCustomMissionTmc(): string {
    return new AeroflyMissionsList(
      this.scenarios.map((s) => {
        return s.mission;
      }),
    ).toString();
  }

  buildReadmeMarkdown(): string {
    if (!this.holdingFix || !this.aircraft) {
      return "";
    }
    const localTime = new LocalTime(new Date(), this.nauticalTimezone);
    const markdownTable = Markdown.table([
      [
        `No `,
        `Local date¹`,
        `Local time¹`,
        `        Wind`,
        `Clouds`,
        `Visibility`,
        `Radial`,
        `Area`,
        `DME`,
        `Turn`,
        `Altitude`,
      ],
      [
        `:-:`,
        `-----------`,
        `----------:`,
        `-----------:`,
        `------`,
        `---------:`,
        `-----:`,
        `----`,
        `---:`,
        `:--:`,
        `-------:`,
      ],
      ...this.scenarios.map((s, index): string[] => {
        const conditions = s.mission.conditions;

        const localNauticalTime = new LocalTime(conditions.time, this.nauticalTimezone);
        const wind = conditions.wind.speed
          ? `${Math.ceil(conditions.wind.speed)} kts @ ${conditions.wind.direction.toFixed(0).padStart(3, "0")}°`
          : "Calm";
        const clouds =
          conditions.clouds[0]?.cover_code !== "CLR"
            ? `${conditions.clouds[0]?.cover_code} @ ${conditions.clouds[0]?.base_feet.toLocaleString("en")} ft`
            : conditions.clouds[0]?.cover_code;

        return [
          `#${String(index + 1).padStart(2, "0")}`,
          localNauticalTime.toDateString(),
          localNauticalTime.toTimeString(),
          wind,
          clouds,
          Math.round(Math.min(conditions.visibility_sm, 10)) + " SM",
          s.pattern.inboundHeading.toFixed(0).padStart(3, "0") + "°",
          Formatter.getDirection(s.pattern.holdingAreaDirection) + (s.pattern.dmeHoldingAwayFromNavaid ? "²" : ""),
          s.pattern.dmeDistanceNm > 0 ? `${s.pattern.dmeDistanceNm} NM` : "—",
          s.pattern.isLeftTurn ? "L" : "R",
          s.pattern.patternAltitudeFt.toLocaleString("en") + " ft",
        ];
      }),
    ]);

    return `\
# Landegerät: Holding at ${this.holdingFix.name}

This file contains ${this.configuration.numberOfMissions} holding procedure lessons for the ${this.aircraft.nameFull} starting in the vicinity of [${this.holdingFix.fullName})](https://skyvector.com/?ll=${encodeURIComponent(this.holdingFix.position.latitude.toString() + "," + this.holdingFix.position.longitude.toString())}5&chart=301&zoom=2).

- See [the installation instructions](https://fboes.github.io/aerofly-missions/docs/generic-installation.html) on how to import [the missions into Aerofly FS 4](missions/custom_missions_user.tmc) and all other files.
- See [the Aerofly FS 4 manual on challenges / missions](https://www.aerofly.com/tutorials/missions/) on how to access these missions in Aerofly FS 4.

## Included missions

There are ${this.configuration.numberOfMissions} missions included in this [custom missions file](missions/custom_missions_user.tmc).

${markdownTable}

- ¹) Local [nautical time](https://en.wikipedia.org/wiki/Nautical_time) with UTC${localTime.timeZone} (${localTime.nauticalZoneId})
- ²) DME procedure is holding _away from_ the ${this.holdingFix.name}, instead of _towards_ it.

---

Created with [Aerofly Landegerät](https://github.com/fboes/aerofly-patterns)
`;
  }

  buildGeoJson(): string {
    const geoJson = new FeatureCollection();

    const scenario = this.scenarios.at(0);
    if (scenario == undefined) {
      throw new Error("No scenario available to build GeoJSON");
    }
    if (this.holdingFix == null) {
      throw new Error("No holding fix available to build GeoJSON");
    }

    geoJson.addFeature(
      new Feature(this.holdingFix.position, {
        id: 0,
        title: this.holdingFix.id,
        desription: this.holdingFix.name,
        "marker-symbol": "communications-tower",
      }),
    );

    const lastCp = scenario.mission.checkpoints.at(-1);

    scenario.mission.checkpoints.forEach((cp, index) => {
      geoJson.addFeature(
        new Feature(new Point(cp.longitude, cp.latitude, cp.altitude), {
          id: index + 1,
          title: cp.name,
          "marker-symbol": cp === lastCp ? "racetrack" : "triangle",
        }),
      );
    });

    const colors = ["#FF1493", "#C2E812", "#91F5AD", "#F96900", "#3B429F"];

    this.scenarios.forEach((scenario, index) => {
      geoJson.addFeature(
        new Feature(
          new LineString([
            new Point(scenario.mission.origin.longitude, scenario.mission.origin.latitude, scenario.mission.origin.alt),
            ...scenario.mission.checkpoints.map((cp): Point => {
              return new Point(cp.longitude, cp.latitude, cp.altitude);
            }),
          ]),
          {
            id: index * 10,
            title: scenario.mission.title,
            description: scenario.mission.description,
            stroke: colors[index % colors.length],
            "stroke-opacity": index === 0 ? 1 : 0.3,
            isLeftTurn: scenario.pattern.isLeftTurn,
            holdingAreaDirection: scenario.pattern.holdingAreaDirection,
            inboundHeading: scenario.pattern.inboundHeading,
            magDec: scenario.holdingNavAid.mag_dec,
            dmeDistanceNm: scenario.pattern.dmeDistanceNm,
            dmeDistanceOutboundNm: scenario.pattern.dmeDistanceOutboundNm,
            patternAltitudeFt: scenario.pattern.patternAltitudeFt,
            patternSpeedKts: scenario.pattern.patternSpeedKts,
            legTimeMin: scenario.pattern.legTimeMin,
            patternEntry: scenario.patternEntry,
          },
        ),
      );

      geoJson.addFeature(
        new Feature(
          new Point(scenario.mission.origin.longitude, scenario.mission.origin.latitude, scenario.mission.origin.alt),
          {
            title: scenario.aircraft.icaoCode,
            description: scenario.aircraft.nameFull,
            id: index * 10 + 1,
            "marker-symbol": (index + 1).toString(),
          },
        ),
      );
    });

    return JSON.stringify(geoJson, null, 2);
  }

  async getHoldingFix(navaidCode: string): Promise<HoldingPatternFix> {
    if (navaidCode.length <= 3) {
      const holdingFix = await AviationWeatherApi.fetchNavaids([navaidCode]);
      if (!holdingFix.length) {
        throw new Error("No holding fix information from API");
      }
      return HoldingPatternFix.fromNavaid(holdingFix[0]);
    } else {
      const holdingFix = await AviationWeatherApi.fetchFix([navaidCode]);
      if (!holdingFix.length) {
        throw new Error("No holding fix information from API");
      }
      return HoldingPatternFix.fromFix(holdingFix[0]);
    }
  }
}
