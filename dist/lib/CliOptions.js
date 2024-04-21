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
   * @returns {string}
   */
  get aircraft() {
    return this.getArgv(3, "C172").toUpperCase();
  }

  /**
   *
   * @returns {string[]} get runway ID which will be right pattern runways
   */
  get getRightPatternRunways() {
    return this.getArgv(3, this.icaoCode === "KMVY" ? "24,33" : "")
      .toUpperCase()
      .split(/[,\s]+/);
  }

  /**
   * @returns {number}
   */
  get numberOfMissions() {
    return 5;
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
