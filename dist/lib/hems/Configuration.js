// @ts-check

import { parseArgs } from "node:util";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

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
    "metar-icao": {
      type: "string",
      short: "m",
      default: "",
      description: "Use this ICAO station code to find weather reports",
      example: "EHAM",
    },
    missions: {
      type: "string",
      default: "10",
      description: "Number of missions in file.",
    },
    callsign: {
      type: "string",
      default: "",
      description: "Optional callsign, else default callsign will be used.",
    },
    "no-guides": {
      type: "boolean",
      default: false,
      description: "Try to remove virtual guides from missions.",
    },
    "cold-dark": {
      type: "boolean",
      default: false,
      description: "Start cold & dark.",
    },
    transfer: {
      type: "boolean",
      short: "t",
      default: false,
      description: "Mission types can also be transfers.",
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
    this.geoJsonFile =
      positionals[0] ??
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data/hems/san_francisco.geojson");
    if (!path.isAbsolute(this.geoJsonFile)) {
      this.geoJsonFile = path.join(process.cwd(), this.geoJsonFile);
    }

    /**
     * @type {string} as in Aerofly Aircraft Codes
     */
    this.aircraft = (positionals[1] ?? "ec135").toLowerCase().replace(/[^a-z0-9]/, "");

    /**
     * @type {string} as in Aerofly Aircraft Codes
     */
    this.livery = (positionals[2] ?? (this.aircraft === "ec135" ? "adac" : "")).toLowerCase().replace(/[^a-z0-9]/, "");

    /**
     * @type {number}
     */
    this.numberOfMissions = Number(values["missions"]);

    /**
     * @type {string}
     */
    this.callsign = String(values["callsign"] ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/, "");

    /**
     * @type {string} use this instead of starting point from GeoJSON
     */
    this.icaoCode = String(values["metar-icao"] ?? "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/, "");

    /**
     * @type {boolean} if files should be created in subfolder
     */
    this.directoryMode = Boolean(values["directory"]);

    /**
     * @type {boolean} if guides should be removed from missions
     */
    this.noGuides = Boolean(values["no-guides"]);

    /**
     * @type {boolean} aircraft starts cold & dark
     */
    this.isColdAndDark = Boolean(values["cold-dark"]);

    /**
     * @type {boolean} missions types can also be "transfer"
     */
    this.canTransfer = Boolean(values["transfer"]);

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
