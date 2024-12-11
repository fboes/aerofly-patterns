// @ts-check

import { parseArgs } from "node:util";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const packageJson = JSON.parse(
  fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../package.json"), "utf8"),
);

/**
 * @typedef ConfigurationPositional
 * @type {object}
 * @property {string} name
 * @property {string} [description]
 * @property {string} [example]
 * @property {string} [default]
 */

/**
 * @typedef ParseArgsParameters
 * @type {object}
 * @property {"string"|"boolean"} type
 * @property {string} [short]
 * @property {boolean|string} [default]
 * @property {string} [description]
 * @property {string} [example]
 */

export class ConfigurationAbstract {
  /**
   * @param {string[]} args
   */
  constructor(args) {
    /**
     * @type {import("../general/ConfigurationAbstract").ConfigurationPositional[]}
     */
    this._arguments = [];

    /**
     * @type {{[key:string]: ParseArgsParameters}}
     */
    this._options = {
      help: {
        type: "boolean",
        short: "h",
        default: false,
        description: "Will output the help.",
      },
    };

    const values = this.parseArgs(args);

    /**
     * @type {boolean}
     */
    this.help = Boolean(values["help"]);
  }

  /**
   * @param {string[]} args
   * @returns {{
   *   values: {[x:string]: string|boolean|undefined},
   *   positionals: string[]
   * }}
   */
  parseArgs(args) {
    return parseArgs({
      args: args.slice(2),
      options: this._options,
      allowPositionals: true,
    });
  }

  /**
   * @returns {string}
   */
  get version() {
    return packageJson.version;
  }

  /**
   * @returns {string}
   */
  get description() {
    return packageJson.description;
  }

  /**
   * @returns {string}
   */
  get name() {
    return packageJson.name;
  }

  /**
   * @returns {string}
   */
  get helpText() {
    /**
     * @type {string[]}
     */
    let parameters = [`v${this.version}: ${this.description}`];

    if (this._arguments) {
      parameters.push("", "Arguments:");

      for (const argument of this._arguments) {
        parameters.push(`\x1b[94m  ${argument.name.padEnd(24, " ")} \x1b[0m ${argument.description}`);

        if (argument.default) {
          parameters.push(`                            Default value: \x1b[4m${argument.default}\x1b[0m`);
        }
        if (argument.example) {
          parameters.push(`                            Example value: \x1b[4m${argument.example}\x1b[0m`);
        }
      }
    }

    if (this._options) {
      parameters.push("", "Options:");

      for (let parameterName in this._options) {
        const option = this._options[parameterName];

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
    }

    return parameters.join("\n");
  }
}
