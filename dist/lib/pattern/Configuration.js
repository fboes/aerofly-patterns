import { ConfigurationAbstract } from "../general/ConfigurationAbstract.js";
export class Configuration extends ConfigurationAbstract {
    constructor(args) {
        super();
        /**
         * @type {ConfigurationPositional[]}
         */
        this._arguments = [
            {
                name: "ICAO_AIRPORT_CODE",
                description: "ICAO airport code which needs to be available in Aerofly FS 4.",
                default: "KEYW",
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
        const { values, positionals } = this.parseArgs(args);
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
}
