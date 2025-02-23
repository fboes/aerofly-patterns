import { parseArgs } from "node:util";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as fs from "node:fs";

const packageJson = JSON.parse(
  fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../package.json"), "utf8"),
);

export interface ConfigurationPositional {
  name: string;
  description?: string;
  example?: string;
  default?: string;
}

export interface ParseArgsParameters {
  type: "string" | "boolean";
  short?: string;
  default?: boolean | string;
  description?: string;
  example?: string;
}

export class ConfigurationAbstract {
  _arguments: ConfigurationPositional[];
  _options: { [key: string]: ParseArgsParameters };
  help: boolean;

  constructor() {
    /**
     * @type {ConfigurationPositional[]}
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

    /**
     * @type {boolean}
     */
    this.help = false;
  }

  parseArgs(args: string[]) {
    return parseArgs({
      args: args.slice(2),
      options: this._options,
      allowPositionals: true,
    });
  }

  get version(): string {
    return packageJson.version;
  }

  get description(): string {
    return packageJson.description;
  }

  get name(): string {
    return packageJson.name;
  }

  get helpText(): string {
    let parameters: string[] = [`v${this.version}: ${this.description}`];

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
