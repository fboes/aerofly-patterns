import { ConfigurationAbstract } from "../general/ConfigurationAbstract.js";

export class Configuration extends ConfigurationAbstract {
  icaoCode: string;

  /**
   * as in Aerofly Aircraft Codes
   */
  aircraft: string;

  /**
   * as in Aerofly Aircraft Codes
   */
  livery: string;

  numberOfMissions: number;
  minCheckpointCount: number;
  maxCheckpointCount: number;
  minAngleChange: number;
  maxAngleChange: number;

  /**
   * in kilometers
   */
  minLegDistance: number;

  /**
   * in kilometers
   */
  maxLegDistance: number;

  /**
   * in feet
   */
  minAltitude: number;

  /**
   * in feet
   */
  maxAltitude: number;

  /**
   * If file(s) should be created in sub directory
   */
  directoryMode: boolean = false;

  constructor(args: string[]) {
    super();

    this._arguments = [
      {
        name: "ICAO_AIRPORT_CODE",
        description: "ICAO airport code which needs to be available in Aerofly FS 4.",
        default: "KROW",
      },
      {
        name: "AFS_AIRCRAFT_CODE",
        description: "Internal aircraft code in Aerofly FS 4.",
        default: "pitts",
      },
      {
        name: "AFS_LIVERY_CODE",
        description: "Internal livery code in Aerofly FS 4.",
        default: "",
      },
    ];

    this._options = {
      missions: {
        type: "string",
        default: "10",
        description: "Number of missions in file.",
      },
      "min-checkpoints": {
        type: "string",
        default: "1",
        description: "Minimum number of checkpoints.",
      },
      "max-checkpoints": {
        type: "string",
        default: "5",
        description: "Maximum number of checkpoints.",
      },
      "min-angle": {
        type: "string",
        default: "15",
        description: "Minimum course change per checkpoints in degree.",
      },
      "max-angle": {
        type: "string",
        default: "90",
        description: "Maximum course change per checkpoints in degree.",
      },
      "min-leg-dist": {
        type: "string",
        default: "1",
        description: "Minimum distance between checkpoints in kilometers.",
      },
      "max-leg-dist": {
        type: "string",
        default: "5",
        description: "Maximum distance between checkpoints in kilometers.",
      },
      "min-alt": {
        type: "string",
        default: "0",
        description: "Minimum altitude in feet. '0' will use the airport altitude + 1500ft.",
      },
      "max-alt": {
        type: "string",
        default: "0",
        description: "Maximum altitude in feet. '0' will use the airport altitude + 3500ft.",
      },
      directory: {
        type: "boolean",
        short: "d",
        default: false,
        description: "Create files in another directory instead of current directory.",
      },
      help: {
        type: "boolean",
        short: "h",
        default: false,
        description: "Will output the help.",
      },
    };

    const { values, positionals } = this.parseArgs(args);

    this.icaoCode = (positionals[0] ?? "KROW").toUpperCase();
    this.aircraft = (positionals[1] ?? "pitts").toLowerCase();
    this.livery = (positionals[2] ?? "").toLowerCase();

    this.numberOfMissions = Number(values["missions"]);
    this.minCheckpointCount = Number(values["min-checkpoints"]);
    this.maxCheckpointCount = Number(values["max-checkpoints"]);
    this.minAngleChange = Number(values["min-angle"]);
    this.maxAngleChange = Number(values["max-angle"]);
    this.minLegDistance = Number(values["min-leg-dist"]);
    this.maxLegDistance = Number(values["max-leg-dist"]);
    this.minAltitude = Number(values["min-alt"]);
    this.maxAltitude = Number(values["max-alt"]);
    this.directoryMode = Boolean(values["directory"]);
    this.help = Boolean(values["help"]);
  }
}
