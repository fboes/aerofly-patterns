// @ts-check

import { parseArgs } from "node:util";

/**
 * @typedef ParseArgsParameters
 * @type {object}
 * @property {"string"|"boolean"} type
 * @property {string} [short]
 * @property {boolean|string} [default]
 * @property {string} [description]
 * @property {string} [example]
 */

export class Configuration {
  /**
   * @type {{[key:string]: ParseArgsParameters}}
   */
  static options = {
    "right-pattern": {
      type: "string",
      default: "",
      description: "Comma-separated list of runway names with right-turn pattern.",
      example: "24,33",
    },
    "min-altitude": {
      type: "string",
      default: "0",
      description: "Minimum safe altitude of aircraft, in 100ft MSL. At least airport elevation.",
      example: "145",
    },
    missions: {
      type: "string",
      default: "10",
      description: "Number of missions in file.",
    },
    distance: {
      type: "string",
      default: "8",
      description: "Initial aircraft distance from airport in Nautical Miles.",
    },
    "pattern-altitude": {
      type: "string",
      default: "1000",
      description: "Pattern altitude in ft AGL. For MSL see `--pattern-altitude-msl`",
    },
    "pattern-distance": {
      type: "string",
      default: "1",
      description: "Pattern distance from airport runway in Nautical Miles.",
    },
    "pattern-final-distance": {
      type: "string",
      default: "1",
      description: "Pattern final distance from airport runway edge in Nautical Miles.",
    },
    "rnd-heading": {
      type: "string",
      default: "0",
      description: "Randomized aircraft heading deviation from direct heading to airport in degree.",
    },
    "prefer-rwy": {
      type: "string",
      default: "",
      description: "Comma-separated list of runway names which are preferred if wind is indecisive.",
      example: "24,33",
    },
    "pattern-altitude-msl": {
      type: "boolean",
      short: "m",
      default: false,
      description: "Pattern altitude is in MSL instead of AGL",
    },
    "no-guides": {
      type: "boolean",
      default: false,
      description: "Try to remove virtual guides from missions.",
    },
    directory: {
      type: "boolean",
      short: "d",
      default: false,
      description: "Create files in a subdirectory instead of current directory.",
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
      description: "Will output the help.",
    },
  };

  /**
   *
   * @param {string[]} args
   */
  constructor(args) {
    const { values, positionals } = parseArgs({
      args: args.slice(2),
      options: Configuration.options,
      allowPositionals: true,
    });

    /**
     * @type {string}
     */
    this.icaoCode = (positionals[0] ?? "KEYW").toUpperCase();

    /**
     * @type {string} as in Aerofly Aircraft Codes
     */
    this.aircraft = (positionals[1] ?? "c172").toLowerCase();

    /**
     * @type {string} as in Aerofly Aircraft Codes
     */
    this.livery = (positionals[2] ?? "").toLowerCase();

    /**
     * @type {string[]} runway IDs which will be right pattern runways
     */
    this.rightPatternRunways = values["right-pattern"]
      ? String(values["right-pattern"])
          .toUpperCase()
          .split(/[,\s]+/)
      : [];

    /**
     * @type {number} in feet
     */
    this.minimumSafeAltitude = Number(values["min-altitude"]) * 100;

    /**
     * @type {number}
     */
    this.numberOfMissions = Number(values["missions"]);

    /**
     * @type {number} in Nautical Miles
     */
    this.initialDistance = Number(values["distance"]);

    /**
     * @type {number} in ft AGL (or MSL if isPatternAltitudeMsl)
     */
    this.patternAltitude = Number(values["pattern-altitude"]);

    /**
     * @type {number} in Nautical Miles
     */
    this.patternDistance = Number(values["pattern-distance"]);

    /**
     * @type {number} in Nautical miles
     */
    this.patternFinalDistance = Number(values["pattern-final-distance"]);

    /**
     * @type {number} Randomized aircraft heading deviation from direct heading to airport in degree.
     */
    this.randomHeadingRange = Number(values["rnd-heading"]);

    /**
     * @type {string[]} runway IDs which will be prefrerred if wind is indecisive
     */
    this.preferredRunways = values["prefer-rwy"]
      ? String(values["prefer-rwy"])
          .toUpperCase()
          .split(/[,\s]+/)
      : [];

    /**
     * @type {boolean} if this.patternAltitude is in MSL instead of AGL
     */
    this.isPatternAltitudeMsl = Boolean(values["pattern-altitude-msl"]);

    /**
     * @type {boolean} if files should be created in subfolder
     */
    this.directoryMode = Boolean(values["directory"]);

    /**
     * @type {boolean} if guides should be removed from missions
     */
    this.noGuides = Boolean(values["no-guides"]);

    /**
     * @type {boolean}
     */
    this.help = Boolean(values["help"]);
  }

  /**
   * @returns {string}
   */
  static argumentList() {
    /**
     * @type {string[]}
     */
    let parameters = [];

    for (let parameterName in Configuration.options) {
      const option = Configuration.options[parameterName];

      let parameter = `--${parameterName}`;
      if (option.type === "string") {
        parameter += "=..";
      }
      if (option.short) {
        parameter += `, -${option.short}`;
        if (option.type === "string") {
          parameter += "=..";
        }
      }

      parameters.push(`\x1b[94m  ${parameter.padEnd(24, " ")} \x1b[0m ${option.description}`);

      if (option.default) {
        parameters.push(`                            Default value: \x1b[4m${option.default}\x1b[0m`);
      }
      if (option.example) {
        parameters.push(`                            Example value: \x1b[4m${option.example}\x1b[0m`);
      }
    }

    return parameters.join("\n");
  }
}
