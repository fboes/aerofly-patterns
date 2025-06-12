import { AeroflyMissionTargetPlane } from "@fboes/aerofly-custom-missions";
import { AeroflyMission, AeroflyMissionCheckpoint } from "@fboes/aerofly-custom-missions";
import { AeroflyMissionPosition } from "@fboes/aerofly-custom-missions/types/dto/AeroflyMission";

export class AeroflyMissionAutofill {
  #mission: AeroflyMission;

  constructor(mission: AeroflyMission) {
    this.#mission = mission;
  }

  get title(): string {
    if (this.#mission.origin.icao == this.#mission.destination.icao) {
      return `Local flight at ${this.#mission.origin.icao}`;
    }
    return `From ${this.#mission.origin.icao} to ${this.#mission.destination.icao}`;
  }

  get description(): string {
    const weatherAdjectives = this.weatherAdjectives;
    const weatherAdjectivesString = weatherAdjectives.length > 0 ? ` ${weatherAdjectives.join(", ")}` : "";

    return `Your ${this.aircraftName} is ${this.flightSetting} on this${weatherAdjectivesString} ${this.timeOfDay} with ${this.wind}.`;
  }

  get tags(): string[] {
    const tags = [];

    if (this.#mission.conditions.wind.speed >= 22) {
      tags.push("windy");
    }
    if (this.#mission.conditions.visibility_sm <= 3) {
      tags.push("low_visibility");
    }
    if (this.timeOfDay === "night") {
      tags.push("night");
    }
    if (this.#mission.flightSetting === "cold_and_dark") {
      tags.push("cold_and_dark");
    } else if (this.#mission.flightSetting === "before_start") {
      tags.push("before_start");
    }

    return tags;
  }

  get weatherAdjectives(): string[] {
    /**
     * @type {string[]}
     */
    const adjectives: string[] = [];
    const conditions = this.#mission.conditions;

    if (conditions.wind.speed >= 48) {
      adjectives.push("stormy");
    } else if (conditions.wind.speed >= 34) {
      adjectives.push("very windy");
    } else if (conditions.wind.gusts >= 10) {
      // Gusty being more interesting as windy
      adjectives.push("gusty");
    } else if (conditions.wind.speed >= 22) {
      adjectives.push("windy");
    }

    if (conditions.visibility_sm <= 1) {
      adjectives.push("foggy");
    } else if (conditions.visibility_sm <= 3) {
      adjectives.push("misty");
    } else {
      switch (conditions.clouds[0]?.cover_code) {
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
    return adjectives;
  }

  /**
   * @param {number} knots in knots
   * @returns {number} duration in seconds, considering aircraft flight setting
   */
  calculateDuration(knots: number): number {
    let duration = (this.#mission.distance ?? 0) / (knots * (1852 / 3600));
    switch (this.#mission.flightSetting) {
      case "cold_and_dark":
        duration += 240;
        break;
      case "before_start":
        duration += 120;
        break;
      case "taxi":
        duration += 60;
        break;
    }
    return duration;
  }

  /**
   * Setting a target plane in around 1 meter distance in front of the aircraft.
   */
  removeGuides() {
    const directionRad = (this.#mission.origin.dir * Math.PI) / 180;
    const offset = 0.00001;

    this.#mission.finish = new AeroflyMissionTargetPlane(
      this.#mission.origin.longitude + Math.sin(directionRad) * offset,
      this.#mission.origin.latitude + Math.cos(directionRad) * offset,
      this.#mission.origin.dir,
    );
  }

  /**
   * Will also set the bearing between the given checkpoints.
   * @returns {number} in meters
   */
  get distance(): number {
    let lastCp: AeroflyMissionCheckpoint | AeroflyMissionPosition = this.#mission.origin;
    let distance = 0;

    for (const cp of this.#mission.checkpoints) {
      const vector = AeroflyMissionAutofill.getDistanceBetweenCheckpoints(lastCp, cp);
      distance += vector.distance;
      cp.direction = vector.bearing;
      lastCp = cp;
    }
    distance += AeroflyMissionAutofill.getDistanceBetweenCheckpoints(lastCp, this.#mission.destination).distance;

    return distance;
  }

  get nauticalTimeHours(): number {
    return (this.#mission.conditions.time.getUTCHours() + this.nauticalTimezoneOffset + 24) % 24;
  }

  get nauticalTimezoneOffset(): number {
    return Math.round((this.#mission.origin.longitude ?? 0) / 15);
  }

  get timeOfDay(): string {
    const nauticalTimeHours = this.nauticalTimeHours;
    if (nauticalTimeHours < 5 || nauticalTimeHours >= 19) {
      return "night";
    }
    if (nauticalTimeHours < 8) {
      return "early morning";
    }
    if (nauticalTimeHours < 11) {
      return "morning";
    }
    if (nauticalTimeHours < 13) {
      return "noon";
    }
    if (nauticalTimeHours < 15) {
      return "afternoon";
    }
    if (nauticalTimeHours < 19) {
      return "late afternoon";
    }

    return "day";
  }

  get aircraftName(): string {
    switch (this.#mission.aircraft.name) {
      case "f15e":
      case "f18":
      case "mb339":
      case "p38":
      case "uh60":
        return this.#mission.aircraft.name.toUpperCase().replace(/^(\D+)(\d+)/, "$1-$2");
      case "camel":
      case "concorde":
      case "jungmeister":
      case "pitts":
      case "swift":
        return this.#mission.aircraft.name[0].toUpperCase() + String(this.#mission.aircraft.name).slice(1);
      default:
        return this.#mission.aircraft.name.toUpperCase().replace(/_/, "-");
    }
  }

  get flightSetting(): string {
    switch (this.#mission.flightSetting) {
      case "cold_and_dark":
        return "cold and dark";
      case "before_start":
        return "just before engine start";
      case "taxi":
        return "ready to taxi";
      case "takeoff":
        return "ready for take-off";
      case "cruise":
        return "cruising";
      case "approach":
        return "in approach configuration";
      case "landing":
        return "in landing configuration";
      case "pushback":
        return "ready for push-back";
      case "aerotow":
        return "towed by a tow-plane";
      case "winch_launch":
        return "ready for winch-launch";
      default:
        return "ready to go";
    }
  }

  get wind() {
    let wind = ``;
    const conditions = this.#mission.conditions;
    if (conditions.wind.speed < 1) {
      wind = `no wind`;
    } else if (conditions.wind.speed <= 5) {
      wind = `almost no wind`;
    } else {
      wind = `wind from ${String(conditions.wind.direction).padStart(3, "0")}° at ${conditions.wind.speed} kts`;
    }

    if (this.#mission.conditions.thermalStrength > 0.8) {
      wind += ` and lots of thermal activity`;
    } else if (this.#mission.conditions.thermalStrength > 0.4) {
      wind += ` and moderate thermal activity`;
    }

    return wind;
  }

  /**
   *
   * @param {AeroflyMissionCheckpoint} lastCp
   * @param {AeroflyMissionCheckpoint} cp
   * @returns {{distance:number,bearing:number}} distance in meters
   */
  static getDistanceBetweenCheckpoints(
    lastCp: AeroflyMissionCheckpoint | AeroflyMissionPosition,
    cp: AeroflyMissionCheckpoint | AeroflyMissionPosition,
  ): { distance: number; bearing: number } {
    const lat1 = (lastCp.latitude / 180) * Math.PI;
    const lon1 = (lastCp.longitude / 180) * Math.PI;
    const lat2 = (cp.latitude / 180) * Math.PI;
    const lon2 = (cp.longitude / 180) * Math.PI;

    const dLon = lon2 - lon1;
    const dLat = lat2 - lat1;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6_371_000 * c;
    return {
      distance,
      bearing,
    };
  }
}
