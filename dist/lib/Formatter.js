// @ts-check

import { Units } from "../data/Units.js";

export class Formatter {
  /**
   *
   * @param {Date} date
   * @param {number} offset
   * @returns {string}
   */
  static getLocalDaytime(date, offset) {
    const localSolarTime = (date.getUTCHours() + offset + 24) % 24;

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
   * @param {number} distance in meters
   * @returns {string}
   */
  static getDistance(distance) {
    const nauticalMiles = distance / Units.meterPerNauticalMile;

    if (nauticalMiles > 10) {
      return Math.round(nauticalMiles).toLocaleString("en") + " NM";
    }
    return (Math.round(nauticalMiles * 10) / 10).toLocaleString("en") + " NM";
  }

  /**
   *
   * @param {import('@fboes/geojson').Vector} vector
   * @param {string} onSite as fallback for distances less than 1 NM
   * @returns {string}
   */
  static getVector(vector, onSite = "on field") {
    if (vector.meters < Units.meterPerNauticalMile) {
      return onSite;
    }

    return Formatter.getDistance(vector.meters) + " to the " + Formatter.getDirection(vector.bearing);
  }

  /**
   * Get a readable direction
   * @param {number} heading
   * @returns {string}
   */
  static getDirectionArrow(heading) {
    const headings = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
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

    if (weather.windSpeed >= 48) {
      adjectives.push("stormy");
    } else if (weather.windSpeed >= 34) {
      adjectives.push("very windy");
    } else if (weather.windGusts >= 10) {
      // Gusty being more interesting as windy
      adjectives.push("gusty");
    } else if (weather.windSpeed >= 22) {
      adjectives.push("windy");
    }

    if (weather.visibility <= 1) {
      adjectives.push("foggy");
    } else if (weather.visibility <= 3) {
      adjectives.push("misty");
    } else {
      switch (weather.clouds[0]?.cloudCoverCode) {
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

  /**
   *
   * @param {Date} date
   * @returns {string}
   */
  static getUtcCompleteDate(date) {
    return (
      date.getUTCFullYear() +
      "-" +
      String(date.getUTCMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getUTCDate()).padStart(2, "0")
    );
  }
}
