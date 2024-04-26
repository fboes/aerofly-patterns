import { AirportRunwayRightPatterns } from "./Airport.js";

// @ts-check
export class CliOptions {
  /**
   *
   * @param {string[]} argv
   */
  constructor(argv) {
    this.argv = argv;
  }

  /**
   *
   * @returns {string}
   */
  get icaoCode() {
    return this.getArgv(2, "KMVY").toUpperCase();
  }

  /**
   *
   * @returns {string} as in Aerofly Aircraft Codes
   */
  get aircraft() {
    return this.getArgv(3, "c172").toLowerCase();
  }

  /**
   *
   * @returns {string[]} get runway ID which will be right pattern runways
   */
  get getRightPatternRunways() {
    const arg = this.getArgv(4, "");
    return arg ? arg.toUpperCase().split(/[,\s]+/) : AirportRunwayRightPatterns[this.icaoCode] ?? [];
  }

  /**
   * @returns {number}
   */
  get numberOfMissions() {
    return 10;
  }

  /**
   * @returns {number} in Nautical Miles
   */
  get initialDistance() {
    return 8;
  }

  /**
   *
   * @param {number} index
   * @param {string} defaultValue
   * @returns {string}
   */
  getArgv(index, defaultValue) {
    return this.argv[index] && this.argv[index] !== "-" ? this.argv[index] : defaultValue;
  }

  /**
   *
   * @returns {{icaoCode:string, aircraft:string}}
   */
  toJSON() {
    return {
      icaoCode: this.icaoCode,
      aircraft: this.aircraft,
    };
  }
}
