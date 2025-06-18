import { ConfigurationAbstract } from "../general/ConfigurationAbstract.js";
export class Configuration extends ConfigurationAbstract {
    constructor(args) {
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
            "min-hold-altitude": {
                type: "string",
                default: "0",
                description: "Minimum altitude of holding pattern, in 100ft MSL. '0' means the rgular altitude will be used.",
                example: "200",
            },
            "max-hold-altitude": {
                type: "string",
                default: "0",
                description: "Maximum altitude of holding pattern, in 100ft MSL. '0' means the rgular altitude will be used",
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
            "dme-holding-away-probability": {
                type: "string",
                default: "0.1",
                description: "Probability of an DME procedure holding away from the navaid instead of towards.",
            },
            "airport-code": {
                type: "string",
                default: "",
                description: "Optional ICAO airport code to fetch METAR weather information for.",
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
        this.dmeHoldingAwayFromNavaidProbability = Number(values["dme-holding-away-probability"]);
        this.minimumDmeDistance = Math.max(Number(values["min-dme-dist"]), 0);
        this.maximumDmeDistance = Math.max(Number(values["max-dme-dist"]), this.minimumDmeDistance);
        this.minimumSafeAltitude = Math.max(Number(values["min-altitude"]) * 100, 0);
        this.maximumAltitude = Math.max(Number(values["max-altitude"]) * 100, this.minimumSafeAltitude);
        this.minimumHoldingAltitude = Number(values["min-hold-altitude"]) * 100 || this.minimumSafeAltitude;
        this.maximumHoldingAltitude = Number(values["max-hold-altitude"]) * 100 || this.maximumAltitude;
        this.inboundHeading = Number(values["inbound-heading"]);
        this.numberOfMissions = Number(values["missions"]);
        this.initialDistance = Number(values["distance"]);
        this.airportCode = String(values["airport-code"]);
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
