import { ConfigurationAbstract } from "../general/ConfigurationAbstract.js";

export class Configuration extends ConfigurationAbstract {
  navaidCode: string;

  /**
   * as in Aerofly Aircraft Codes
   */
  aircraft: string;

  /**
   * as in Aerofly Aircraft Codes
   */
  livery: string;

  /**
   * Probability of an alternate pattern being used in the mission.
   * Default is 0.1 (10%).
   * This is a value between 0 and 1.
   */
  leftHandPatternProbability: number;

  /**
   * Probability of an DME procedure being used in the mission.
   * Default is 0.1 (10%).
   * This is a value between 0 and 1.
   */
  dmeProcedureProbability: number;

  /**
   * Probability of an DME procedure being inverse.
   */
  dmeHoldingTowardNavaidProbability: number;

  /**
   * Minimum DME distance in Nautical Miles.
   */
  minimumDmeDistance: number;

  /**
   * Maximum DME distance in Nautical Miles.
   */
  maximumDmeDistance: number;

  /**
   * Minimum safe altitude of aircraft, in ft MSL.
   */
  minimumSafeAltitude: number;

  /**
   * Maximum altitude of aircraft, in ft MSL.
   **/
  maximumAltitude: number;

  /**
   * Heading of inbound leg in degrees.
   * Default is -1.
   */
  inboundHeading: number;

  numberOfMissions: number;

  /**
   * Initial aircraft distance from holding fix in Nautical Miles.
   * Default is 5.
   */
  initialDistance: number;
  directoryMode: boolean;
  noGuides: boolean;

  constructor(args: string[]) {
    super();

    this._arguments = [
      {
        name: "NAVAID_CODE",
        description: "NavAid code which is holding fix. Needs to be available in Aerofly FS 4.",
        default: "GND",
      },
      {
        name: "AFS_AIRCRAFT_CODE",
        description: "Internal aircraft code in Aerofly FS 4.",
        default: "c172",
      },
      {
        name: "AFS_LIVERY_CODE",
        description: "Internal livery code in Aerofly FS 4.",
        default: "",
      },
    ];

    /**
     * @type {{[key:string]: ParseArgsParameters}}
     */
    this._options = {
      "inbound-heading": {
        type: "string",
        default: "-1",
        description: "Heading of inbound leg in degrees. Default is -1, meaning that the inbound leg will be random.",
        example: "180",
      },
      "min-altitude": {
        type: "string",
        default: "100",
        description: "Minimum safe altitude of aircraft, in 100ft MSL. '100' means 10,000ft MSL.",
      },
      "max-altitude": {
        type: "string",
        default: "0",
        description: "Maximum altitude of aircraft, in 100ft MSL. '0' means that the minimum altitude will be used.",
        example: "200",
      },
      "min-dme-dist": {
        type: "string",
        default: "5",
        description: "Minimum DME distance in Nautical Miles.",
      },
      "max-dme-dist": {
        type: "string",
        default: "10",
        description: "Maximum DME distance in Nautical Miles.",
      },
      missions: {
        type: "string",
        default: "10",
        description: "Number of missions in file.",
      },
      distance: {
        type: "string",
        default: "5",
        description: "Initial aircraft distance from holding fix in Nautical Miles.",
      },
      "left-probability": {
        type: "string",
        default: "0.1",
        description: "Probability of an left-hand pattern being used in the mission.",
      },
      "dme-probability": {
        type: "string",
        default: "0.1",
        description: "Probability of an DME procedure being used in the mission.",
      },
      "dme-holding-toward-probability": {
        type: "string",
        default: "0.5",
        description: "Probability of an DME procedure holding toward the navaid instead of away from.",
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

    const { values, positionals } = this.parseArgs(args);

    this.navaidCode = (positionals[0] ?? "GND").toUpperCase();
    this.aircraft = (positionals[1] ?? "c172").toLowerCase();
    this.livery = (positionals[2] ?? "").toLowerCase();

    this.leftHandPatternProbability = Number(values["left-probability"]);
    this.dmeProcedureProbability = Number(values["dme-probability"]);
    this.dmeHoldingTowardNavaidProbability = Number(values["dme-holding-toward-probability"]);
    this.minimumDmeDistance = Math.max(Number(values["min-dme-dist"]), 0);
    this.maximumDmeDistance = Math.max(Number(values["max-dme-dist"]), this.minimumDmeDistance);
    this.minimumSafeAltitude = Math.max(Number(values["min-altitude"]) * 100, 0);
    this.maximumAltitude = Math.max(Number(values["max-altitude"]) * 100, this.minimumSafeAltitude);
    this.inboundHeading = Number(values["inbound-heading"]);
    this.numberOfMissions = Number(values["missions"]);
    this.initialDistance = Number(values["distance"]);

    /**
     * @type {boolean} if guides should be removed from missions
     */
    this.noGuides = Boolean(values["no-guides"]);

    /**
     * @type {boolean} if files should be created in subfolder
     */
    this.directoryMode = Boolean(values["directory"]);

    /**
     * @type {boolean}
     */
    this.help = Boolean(values["help"]);
  }
}
