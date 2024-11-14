// @ts-check

import { AeroflyMission, AeroflyMissionCheckpoint } from "@fboes/aerofly-custom-missions";

export default class AeroflyMissionDescription {
  /**
   * @type {AeroflyMission}
   */
  #mission;

  /**
   *
   * @param {AeroflyMission} mission
   */
  constructor(mission) {
    this.#mission = mission;
  }

  /**
   *
   * @param {string} text
   * @returns {string}
   */
  #getAorAn(text) {
    return text.match(/^[aeiou]/) ? "an" : "a";
  }

  /**
   * @returns {string}
   */
  get description() {
    let weatherAdjectives = this.weatherAdjectives;
    let weatherAdjectivesString = "";
    if (weatherAdjectives.length > 0) {
      weatherAdjectivesString = ` ${this.#getAorAn(weatherAdjectives[0])} ${weatherAdjectives.join(", ")}`;
    }

    let description = `It is${weatherAdjectivesString} ${this.timeOfDay} with ${this.wind}.`;
    if (this.#mission.flightSetting === "cold_and_dark") {
      description += ` Your aircraft is cold and dark.`;
    }

    return description;
  }

  /**
   * @returns {string[]}
   */
  get tags() {
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
    }

    return tags;
  }

  /**
   * @returns {string[]}
   */
  get weatherAdjectives() {
    /**
     * @type {string[]}
     */
    const adjectives = [];
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
   * @returns {number} duration in seconds
   */
  calculateDuration(knots) {
    return this.#mission.distance / (knots * (1852 / 3600));
  }

  /**
   * @returns {number} in meters
   */
  get distance() {
    /**
     * @type {AeroflyMissionCheckpoint?}
     */
    let lastCp = null;
    let distance = 0;

    for (const cp of this.#mission.checkpoints) {
      if (lastCp !== null) {
        distance += AeroflyMissionDescription.getDistanceBetweenCheckpoints(lastCp, cp);
      }

      lastCp = cp;
    }

    return distance;
  }

  get nauticalTime() {
    return (this.#mission.conditions.time.getUTCHours() + this.nauticalTimezoneOffset + 24) % 24;
  }

  get nauticalTimezoneOffset() {
    return Math.round((this.#mission.origin.longitude ?? 0) / 15);
  }

  get timeOfDay() {
    const nauticalTime = this.nauticalTime;
    if (nauticalTime < 5 || nauticalTime >= 19) {
      return "night";
    }
    if (nauticalTime < 8) {
      return "early morning";
    }
    if (nauticalTime < 11) {
      return "morning";
    }
    if (nauticalTime < 13) {
      return "noon";
    }
    if (nauticalTime < 15) {
      return "afternoon";
    }
    if (nauticalTime < 19) {
      return "late afternoon";
    }

    return "day";
  }

  get wind() {
    let wind = ``;
    const conditions = this.#mission.conditions;
    if (conditions.wind.speed < 1) {
      wind = `no wind`;
    } else if (conditions.wind.speed <= 5) {
      wind = `almost no wind`;
    } else {
      wind = `wind from ${conditions.wind.direction}° at ${conditions.wind.speed} kts`;
    }
    return wind;
  }

  /**
   *
   * @param {AeroflyMissionCheckpoint} lastCp
   * @param {AeroflyMissionCheckpoint} cp
   * @returns {number} distance in meters
   */
  static getDistanceBetweenCheckpoints(lastCp, cp) {
    const lat1 = (lastCp.latitude / 180) * Math.PI;
    const lon1 = (lastCp.longitude / 180) * Math.PI;
    const lat2 = (cp.latitude / 180) * Math.PI;
    const lon2 = (cp.longitude / 180) * Math.PI;

    const dLon = lon2 - lon1;
    const dLat = lat2 - lat1;

    //const y = Math.sin(dLon) * Math.cos(lat2);
    //const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    //const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6_371_000 * c;
  }
}
