// @ts-check

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
