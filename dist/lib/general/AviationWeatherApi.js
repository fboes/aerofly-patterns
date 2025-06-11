import { Vector } from "@fboes/geojson";
export class AviationWeatherApi {
    static async fetchMetar(ids, date = null) {
        return AviationWeatherApi.doRequest("/api/data/metar", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
        }));
    }
    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @param date if given, only metars for this date will be returned, otherwise the latest metars
     * @see https://aviationweather.gov/data/api/#/Data/dataMetar
     * @returns {Promise<AviationWeatherApiMetar[]>}
     */
    static async fetchMetarByPosition(position, distance = 1000, date = null) {
        return AviationWeatherApi.doRequest("/api/data/metar", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            // taf,
            // hours,
            bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            date: date ? date.toISOString().replace(/\.\d+(Z)/, "$1") : "",
        }));
    }
    static async fetchAirports(ids) {
        return AviationWeatherApi.doRequest("/api/data/airport", new URLSearchParams({
            ids: ids.join(","),
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
            format: "json",
        }));
    }
    static async fetchNavaids(ids) {
        return AviationWeatherApi.doRequest("/api/data/navaid", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
        })).then((data) => {
            return AviationWeatherApi.normalizeNavAid(data);
        });
    }
    static async fetchFix(ids) {
        return AviationWeatherApi.doRequest("/api/data/fix", new URLSearchParams({
            ids: ids.join(","),
            format: "json",
            // bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
        }));
    }
    /**
     * @param position center of search area
     * @param distance in meters, default 1000
     * @see https://aviationweather.gov/data/api/#/Data/dataNavaid
     * @returns {Promise<AviationWeatherApiNavaid[]>}
     */
    static async fetchNavaidsByPosition(position, distance = 1000) {
        return AviationWeatherApi.doRequest("/api/data/navaid", new URLSearchParams({
            // ids: ids.join(","),
            format: "json",
            bbox: AviationWeatherApi.buildBbox(position, distance).join(","),
        })).then((data) => {
            return AviationWeatherApi.normalizeNavAid(data);
        });
    }
    static normalizeNavAid(data) {
        return data.map((navaid) => {
            return {
                ...navaid,
                lat: Number(navaid.lat),
                lon: Number(navaid.lon),
                elev: Number(navaid.elev),
                freq: Number(navaid.freq),
                mag_dec: magDecConverter(navaid.mag_dec),
            };
        });
    }
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    static async doRequest(route, query) {
        const url = new URL(route + "?" + query, "https://aviationweather.gov");
        //console.log(url);
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
            },
        });
        return await response.json();
    }
    /**
     *
     * @param {Point} position
     * @param {number} [distance] in meters
     * @returns {[number,number,number,number]} southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude
     */
    static buildBbox(position, distance = 1000) {
        const southEast = position.getPointBy(new Vector(distance, 225));
        const northWest = position.getPointBy(new Vector(distance, 45));
        return [southEast.latitude, southEast.longitude, northWest.latitude, northWest.longitude];
    }
}
/**
 * @returns {number} with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
 */
export const magDecConverter = (magdec) => {
    let magDec = 0;
    const magdecMatch = magdec.match(/^(\d+)(E|W)$/);
    if (magdecMatch) {
        magDec = Number(magdecMatch[1]);
        if (magdecMatch[2] === "W") {
            magDec *= -1;
        }
    }
    return magDec;
};
export class AviationWeatherNormalizedAirport {
    /**
     * @param {AviationWeatherApiAirport} apiData
     */
    constructor({ icaoId, name, type, lat, lon, elev, magdec, rwyNum, tower, beacon, runways, freqs, }) {
        this.icaoId = icaoId;
        this.name = name
            .replace(/_/g, " ")
            .trim()
            .replace(/\bINTL\b/g, "INTERNATIONAL")
            .replace(/\bRGNL\b/g, "REGIONAL")
            .replace(/\bFLD\b/g, "FIELD")
            .replace(/(\/)/g, " $1 ")
            .toLowerCase()
            .replace(/(^|\s)[a-z]/g, (char) => {
            return char.toUpperCase();
        });
        this.type = type;
        this.lat = lat;
        this.lon = lon;
        this.elev = elev;
        this.magdec = magDecConverter(magdec);
        this.rwyNum = Number(rwyNum);
        this.tower = tower === "T";
        this.beacon = beacon === "B";
        this.runways = runways.map((r) => {
            return new AviationWeatherNormalizedRunway(r);
        });
        this.freqs =
            typeof freqs !== "string"
                ? freqs
                : freqs.split(";").map(
                /**
                 * @param {string} f
                 * @returns {AviationWeatherApiFrequency}
                 */
                (f) => {
                    const parts = f.split(",");
                    return {
                        type: parts[0],
                        freq: parts[1] ? Number(parts[1]) : undefined,
                    };
                });
    }
}
export class AviationWeatherNormalizedRunway {
    constructor({ id, dimension, surface, alignment }) {
        /**
         * @type {[string,string]} both directions
         */
        this.id = ["", ""];
        id.split("/").forEach((i, index) => {
            this.id[index] = i;
        });
        this.dimension = [0, 0];
        dimension
            .split("x")
            .map((x) => Number(x))
            .forEach((d, index) => {
            this.dimension[index] = d;
        });
        this.surface = surface;
        this.alignment = alignment !== "-" ? Number(alignment) : null;
    }
}
export class AviationWeatherNormalizedMetar {
    /**
     *
     * @param {AviationWeatherApiMetar} apiData
     */
    constructor({ icaoId, reportTime, temp, dewp, wdir, wspd, wgst, visib, altim, lat, lon, elev, clouds, }) {
        this.icaoId = icaoId;
        this.reportTime = new Date(Date.parse(reportTime + " GMT"));
        this.temp = temp;
        this.dewp = dewp;
        this.wdir = wdir !== "VRB" ? wdir : null;
        this.wspd = wspd;
        /**
         * @type {number?} in kts
         */
        this.wgst = wgst;
        /**
         * @type {number} in SM, 99 on any distance being open-ended
         */
        this.visib = typeof visib === "string" ? 99 : visib;
        /**
         * @type {number} in hPa
         */
        this.altim = altim;
        this.lat = lat;
        this.lon = lon;
        this.elev = elev;
        /**
         * @type {AviationWeatherNormalizedCloud[]}
         */
        this.clouds = clouds.map((c) => {
            return new AviationWeatherNormalizedCloud(c);
        });
    }
}
export class AviationWeatherNormalizedCloud {
    constructor({ cover, base }) {
        this.cover = cover === "CAVOK" || cover === "SKC" ? "CLR" : cover;
        const coverOctas = {
            CLR: 0,
            FEW: 1,
            SCT: 2,
            BKN: 4,
            OVC: 8,
        };
        this.coverOctas = coverOctas[this.cover] ?? 0;
        this.base = base;
    }
}
