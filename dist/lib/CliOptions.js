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
    return arg ? arg.toUpperCase().split(/[,\s]+/) : [];
  }

  /**
   * @returns {number} in feet
   */
  get mimimumSafeAltitude() {
    return Number(this.getArgv(5, "0")) * 100;
  }

  /**
   * @returns {boolean} if files should be created in subfolder
   */
  get folderMode() {
    return this.getArgv(6, "") !== "";
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
