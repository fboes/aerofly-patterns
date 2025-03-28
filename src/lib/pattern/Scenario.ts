import { Point, Vector } from "@fboes/geojson";
import { Units } from "../../data/Units.js";
import { Configuration } from "./Configuration.js";
import { AviationWeatherApi } from "../general/AviationWeatherApi.js";
import { Formatter } from "../general/Formatter.js";
import { AeroflyAircraft, AeroflyAircraftFinder } from "../../data/AeroflyAircraft.js";
import { Degree, degreeDifference, degreeToRad } from "../general/Degree.js";
import { Airports } from "../../data/Airports.js";
import { AeroflyMissionCheckpoint } from "@fboes/aerofly-custom-missions";
import { ScenarioWeather } from "../general/ScenarioWeather.js";
import { AeroflyPatternsWaypointable } from "./AeroflyPatterns.js";
import { Airport, AirportRunway } from "./Airport.js";

/**
 * A scenario consists of the plane and its position relative to the airport,
 * the weather,
 * the active runway
 * and the entry method.
 */
export class Scenario {
  airport: Airport;
  configuration: Configuration;
  aircraft: ScenarioAircraft;
  weather: ScenarioWeather | null;
  date: Date;
  activeRunway: AirportRunway | null;
  activeRunwayCrosswindComponent: number;
  patternWaypoints: AeroflyPatternsWaypointable[];
  entryWaypoint: AeroflyPatternsWaypointable | null;

  constructor(airport: Airport, configuration: Configuration, date: Date | null = null) {
    this.airport = airport;
    this.configuration = configuration;

    if (!configuration.minimumSafeAltitude) {
      configuration.minimumSafeAltitude = Airports[airport.id]?.minimumSafeAltitude ?? 0;
    }

    /**
     * @type {number} in feet
     */
    const minimumSafeAltitude: number = Math.max(
      (this.airport.position.elevation ?? 0) + 1500,
      configuration.minimumSafeAltitude,
    );

    /**
     * @type {ScenarioAircraft}
     */
    this.aircraft = new ScenarioAircraft(
      airport,
      configuration.aircraft,
      configuration.initialDistance,
      minimumSafeAltitude,
      configuration.randomHeadingRange,
      configuration.livery,
    );

    this.weather = null;
    this.date = date ?? new Date();

    /**
     * @type {AirportRunway?}
     */
    this.activeRunway = null;

    /**
     * @type {number} in feet per second
     */
    this.activeRunwayCrosswindComponent = 0;
    this.patternWaypoints = [];
    this.entryWaypoint = null;
  }

  static async init(airport: Airport, configuration: Configuration, date: Date | null): Promise<Scenario> {
    const self = new Scenario(airport, configuration, date);
    const weather = await AviationWeatherApi.fetchMetar([self.airport.id], self.date);
    if (!weather.length) {
      throw new Error("No METAR information from API for " + self.airport.id);
    }
    self.weather = new ScenarioWeather(weather[0]);
    self.getActiveRunway();
    return self;
  }

  getActiveRunway() {
    const counterWindDirection = this.weather?.windDirection ?? 0;

    const difference = (alignment: number): number => {
      return Math.abs(degreeDifference(alignment, counterWindDirection));
    };

    let possibleRunways = this.airport.runways
      .filter((r) => {
        return r.runwayType === null || r.runwayType === this.aircraft.data.type;
      })
      .filter((r) => {
        return (
          this.aircraft.data.runwayLanding === null ||
          this.aircraft.data.runwayLanding === 0 ||
          this.aircraft.data.runwayLanding <= r.dimension[0]
        );
      });

    if (!this.weather || this.weather?.windSpeed <= 5) {
      const preferredRunways = possibleRunways.filter((r) => {
        return r.isPreferred;
      });

      if (preferredRunways.length > 0) {
        possibleRunways = preferredRunways;
      }
    }

    this.activeRunway = possibleRunways.reduce((a, b) => {
      return difference(a.alignment) < difference(b.alignment) ? a : b;
    });

    /**
     * @type {number} in meters
     */
    const exitDistance: number = this.configuration.patternDistance * Units.meterPerNauticalMile;

    /**
     * @type {number} in meters
     */
    const downwindDistance: number = this.configuration.patternDistance * Units.meterPerNauticalMile;

    /**
     * @type {number} in meters
     */
    const finalDistance: number = this.configuration.patternFinalDistance * Units.meterPerNauticalMile;

    /**
     * @type {number} in degree
     */
    const patternOrientation: number = Degree(
      this.activeRunway.alignment + (this.activeRunway.isRightPattern ? 90 : 270),
    );

    /**
     * @type {number} in meters MSL
     */
    let patternAltitude: number = this.configuration.patternAltitude / Units.feetPerMeter;
    if (!this.configuration.isPatternAltitudeMsl && this.airport.position.elevation) {
      patternAltitude += this.airport.position.elevation;
    }

    /**
     * @type {number} meters to sink per meter distance to have 3° glide slope
     */
    const glideSlope: number = 319.8 / Units.feetPerMeter / Units.meterPerNauticalMile;

    if (this.weather?.windDirection) {
      const crosswindAngle = degreeDifference(this.activeRunway.alignment, this.weather.windDirection);
      this.activeRunwayCrosswindComponent = Math.sin(degreeToRad(crosswindAngle)) * this.weather.windSpeed;
    }

    // Final
    const activeRunwayFinal = this.activeRunway.position.getPointBy(
      new Vector(finalDistance, Degree(this.activeRunway.alignment + 180)),
    );
    const finalAltitude = (this.airport.position.elevation ?? 0) + finalDistance * glideSlope;
    activeRunwayFinal.elevation = Math.min(finalAltitude, patternAltitude);

    // Base
    const activeRunwayBase = activeRunwayFinal.getPointBy(new Vector(downwindDistance, patternOrientation));
    const baseAltitude = finalAltitude + downwindDistance * glideSlope;
    activeRunwayBase.elevation = Math.min(baseAltitude, patternAltitude);

    // Crosswind
    const activeRunwayCrosswind = this.activeRunway.position.getPointBy(
      new Vector(this.activeRunway.dimension[0] / Units.feetPerMeter + exitDistance, this.activeRunway.alignment),
    );
    activeRunwayCrosswind.elevation = patternAltitude;

    // Entry
    const activeRunwayEntry = this.airport.position.getPointBy(new Vector(downwindDistance, patternOrientation));
    activeRunwayEntry.elevation = patternAltitude;

    this.patternWaypoints = [
      {
        id: this.activeRunway.id + "-CROSS",
        position: activeRunwayCrosswind,
      },
      {
        id: this.activeRunway.id + "-DOWN",
        position: activeRunwayCrosswind.getPointBy(new Vector(downwindDistance, patternOrientation)),
      },
      {
        id: this.activeRunway.id + "-ENTRY",
        position: activeRunwayEntry,
      },
      {
        id: this.activeRunway.id + "-BASE",
        position: activeRunwayBase,
      },
      {
        id: this.activeRunway.id + "-FINAL",
        position: activeRunwayFinal,
      },
    ];

    this.entryWaypoint = {
      id: this.activeRunway.id + "-VENTRY",
      position: activeRunwayEntry.getPointBy(
        new Vector(
          0.5 * Units.meterPerNauticalMile,
          Degree(patternOrientation + (this.activeRunway.isRightPattern ? -45 : 45)),
        ),
      ),
    };
  }

  get tags(): string[] {
    const tags = ["approach", "pattern", "practice"];
    if (this.activeRunwayCrosswindComponent > 4.5) {
      tags.push("crosswind");
    }
    if (this.weather?.windSpeed && this.weather.windSpeed >= 22) {
      tags.push("windy");
    }
    if (this.weather?.visibility && this.weather.visibility <= 3) {
      tags.push("low_visibility");
    }
    if (Formatter.getLocalDaytime(this.date, this.airport.nauticalTimezone) === "night") {
      tags.push("night");
    }
    if (this.activeRunway?.ilsFrequency) {
      tags.push("instruments");
    }
    if (this.activeRunway?.dimension[0] && this.activeRunway.dimension[0] <= 2000) {
      tags.push("short_runway");
    }

    return tags;
  }

  get description(): string | null {
    if (!this.activeRunway) {
      return null;
    }

    //const distance = Formatter.getNumberString(this.aircraft.distanceFromAirport);
    const vector = Formatter.getVector(this.aircraft.vectorFromAirport);
    const towered = this.airport.hasTower ? "towered" : "untowered";
    let weatherAdjectives = this.weather ? Formatter.getWeatherAdjectives(this.weather) : "";
    if (weatherAdjectives) {
      weatherAdjectives = `a ${weatherAdjectives} `;
    }

    let crossWind = "";
    if (this.activeRunwayCrosswindComponent > 4.5) {
      crossWind = ` / ${Math.ceil(this.activeRunwayCrosswindComponent)} kts crosswind component`;
    }
    const runway = `${this.activeRunway.id} (${Math.round(this.activeRunway.alignment - this.airport.magneticDeclination)}° / ${Math.round(this.activeRunway.dimension[0] / Units.feetPerMeter).toLocaleString("en")}m${crossWind})`;

    const elevation =
      this.airport.position.elevation !== null
        ? ` (${Math.ceil(this.airport.position.elevation * Units.feetPerMeter).toLocaleString("en")}ft)`
        : "";

    let description = `It is ${weatherAdjectives}${Formatter.getLocalDaytime(this.date, this.airport.nauticalTimezone)}, and you are ${vector} of the ${towered} airport ${this.airport.name}${elevation}. `;

    let wind = ``;
    if (this.weather) {
      if (this.weather.windSpeed < 1) {
        wind = `As there is no wind`;
      } else if (this.weather.windSpeed <= 5) {
        wind = `As there is almost no wind`;
      } else {
        wind = `As the wind is ${this.weather.windSpeed ?? 0} kts from ${this.weather.windDirection ?? 0}°`;
      }
    }

    description += wind ? `${wind}, the main landing runway is ${runway}. ` : `The main landing runway is ${runway}. `;

    if (this.activeRunway.ilsFrequency && !this.aircraft.data.hasNoRadioNav) {
      description += `You may want to use the ILS (${this.activeRunway.ilsFrequency.toFixed(2)}). `;
    }

    description += `Fly the ${this.activeRunway.isRightPattern ? "right-turn " : ""}pattern and land safely.`;

    const airportDescription = this.airport.getDescription(this.aircraft.data.hasNoRadioNav !== true);
    if (airportDescription) {
      description += "\n" + airportDescription;
    }

    return description;
  }

  /**
   * @returns {AeroflyMissionCheckpoint[]} `Waypoint, type, length, frequency`; will return an empty array if not all preconditions are met
   */
  get waypoints(): AeroflyMissionCheckpoint[] {
    if (!this.activeRunway) {
      return [];
    }

    /**
     * @param {AeroflyPatternsWaypointable} waypoint
     * @param {"origin"|"departure_runway"|"waypoint"|"destination_runway"|"destination"} type
     * @param {number?} [length] optional in meters
     * @param {number?} [frequency] optional in Hz
     * @returns {AeroflyMissionCheckpoint}
     */
    const makeCheckpoint = (
      waypoint: AeroflyPatternsWaypointable,
      type: "origin" | "departure_runway" | "waypoint" | "destination_runway" | "destination",
      length: number | null = null,
      frequency: number | null = null,
    ): AeroflyMissionCheckpoint => {
      const checkpoint = new AeroflyMissionCheckpoint(
        waypoint.id,
        type,
        waypoint.position.longitude,
        waypoint.position.latitude,
        {
          altitude: waypoint.position.elevation ?? 0,
        },
      );

      if (length) {
        checkpoint.length = length;
      }
      if (frequency) {
        checkpoint.frequency = frequency;
      }
      return checkpoint;
    };

    /**
     * @type {AeroflyMissionCheckpoint[]}
     */
    const waypoints: AeroflyMissionCheckpoint[] = [
      makeCheckpoint(this.airport, "origin"),
      makeCheckpoint(
        this.activeRunway,
        "departure_runway",
        this.activeRunway.dimension[0] / Units.feetPerMeter,
        this.activeRunway.ilsFrequency * 1_000_000,
      ),
    ];

    this.patternWaypoints.forEach((p) => {
      waypoints.push(makeCheckpoint(p, "waypoint"));
    });

    waypoints.push(
      makeCheckpoint(
        this.activeRunway,
        "destination_runway",
        this.activeRunway.dimension[0] / Units.feetPerMeter,
        this.activeRunway.ilsFrequency * 1_000_000,
      ),
      makeCheckpoint(this.airport, "destination"),
    );

    return waypoints;
  }
}

/**
 * @type  {AeroflyPatternsWaypointable}
 */
class ScenarioAircraft {
  vectorFromAirport: Vector;
  position: Point;
  heading: number;
  id: string;
  aeroflyCode: string;
  aeroflyLiveryCode: string;
  data: AeroflyAircraft;
  /**
   *
   * @param {Airport} airport
   * @param {string} aircraftCode Aerofly Aircraft Code
   * @param {number} distanceFromAirport in Nautical Miles
   * @param {number} minimumSafeAltitude in ft
   * @param {number} [randomHeadingRange] in degree
   * @param {string} [aircraftLivery] Aerofly Aircraft Code
   */
  constructor(
    airport: Airport,
    aircraftCode: string,
    distanceFromAirport: number,
    minimumSafeAltitude: number,
    randomHeadingRange: number = 0,
    aircraftLivery: string = "",
  ) {
    /**
     * @type {Vector} how the aircraft relates to the airport
     */
    this.vectorFromAirport = new Vector(distanceFromAirport * Units.meterPerNauticalMile, Math.random() * 360);

    this.position = airport.position.getPointBy(this.vectorFromAirport);

    const altitude =
      this.vectorFromAirport.bearing > 180 // bearing - 180 = course
        ? Math.ceil((minimumSafeAltitude - 1500) / 2000) * 2000 + 1500 // 3500, 5500, ..
        : Math.ceil((minimumSafeAltitude - 500) / 2000) * 2000 + 500; // 4500, 6500, ..
    this.position.elevation = altitude / Units.feetPerMeter;

    /**
     * @type {number} Heading of aircraft. Can be randomized
     */
    this.heading = Degree(
      this.vectorFromAirport.bearing + 180 + (randomHeadingRange ? (Math.random() * 2 - 1) * randomHeadingRange : 0),
    );

    this.id = "current";

    /**
     * @type {string}
     */
    this.aeroflyCode = aircraftCode;

    /**
     * @type {string}
     */
    this.aeroflyLiveryCode = aircraftLivery;

    /**
     * @type {AeroflyAircraft} additional aircraft information like name and technical properties
     */
    this.data = AeroflyAircraftFinder.get(aircraftCode);
  }
}
