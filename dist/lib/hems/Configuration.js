import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { ConfigurationAbstract } from "../general/ConfigurationAbstract.js";
export class Configuration extends ConfigurationAbstract {
    constructor(args) {
        super();
        /**
         * @type {ConfigurationPositional[]}
         */
        this._arguments = [
            {
                name: "GEOJSON_FILE",
                description: "GeoJSON file containing possible mission locations.",
            },
            { name: "AFS_AIRCRAFT_CODE", description: "Internal aircraft code in Aerofly FS 4.", default: "ec135" },
            { name: "AFS_LIVERY_CODE", description: "Internal livery code in Aerofly FS 4", default: "adac" },
        ];
        /**
         * @type {{[key:string]: ParseArgsParameters}}
         */
        this._options = {
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
                default: "MEDEVAC",
                description: "Optional callsign, else default callsign will be used.",
            },
            "no-guides": {
                type: "boolean",
                default: false,
                description: "Try to remove virtual guides from missions.",
            },
            "cold-dark": {
                type: "boolean",
                short: "c",
                default: false,
                description: "Start cold & dark.",
            },
            transfer: {
                type: "boolean",
                short: "t",
                default: false,
                description: "Mission types can also be transfers.",
            },
            approach: {
                type: "boolean",
                short: "a",
                default: false,
                description: "Add approach guides to flight plan.",
            },
            "no-poi": {
                type: "boolean",
                short: "p",
                default: false,
                description: "Do not generate POI files.",
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
        /**
         * @type {string}
         */
        this.geoJsonFile =
            positionals[0] ??
                path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../src/data/hems/san_francisco.geojson");
        if (!path.isAbsolute(this.geoJsonFile)) {
            this.geoJsonFile = path.join(process.cwd(), this.geoJsonFile);
        }
        /**
         * @type {string} an identifier for the environment
         */
        this.environmentId = path
            .basename(this.geoJsonFile, path.extname(this.geoJsonFile))
            .toLowerCase()
            .replace(/[^a-z0-9_]/, "_");
        /**
         * @type {string} as in Aerofly Aircraft Codes
         */
        this.aircraft = (positionals[1] ?? "ec135").toLowerCase().replace(/[^a-z0-9]/, "");
        /**
         * @type {string} as in Aerofly Aircraft Codes
         */
        this.livery = (positionals[2] ?? (this.aircraft === "ec135" ? "adac" : "")).toLowerCase().replace(/[^a-z0-9]/, "");
        this.numberOfMissions = Number(values["missions"]);
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
         * @type {boolean} Add approach guides to flight plan.
         */
        this.withApproaches = Boolean(values["approach"]);
        /**
         * @type {boolean} Do not generate POI files.
         */
        this.doNotGeneratePois = Boolean(values["no-poi"]);
        this.help = Boolean(values["help"]);
    }
}
