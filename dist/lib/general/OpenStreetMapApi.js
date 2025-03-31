/**
 * @see https://nominatim.org/release-docs/develop/api/Overview/
 */
export class OpenStreetMapApi {
    static async search(q, limit = 1) {
        return OpenStreetMapApi.doRequest("/search", new URLSearchParams({
            q,
            format: "json",
            limit: String(limit),
            extratags: "1",
            namedetails: "1",
        }));
    }
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    static async doRequest(route, query) {
        const url = new URL(route + "?" + query, "https://nominatim.openstreetmap.org");
        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                "Accept-Language": "en-US",
            },
        });
        return await response.json();
    }
}
export class OpenStreetMapApiAirport {
    constructor(airport) {
        this.icaoId = airport.namedetails.icao ?? null;
        this.name = airport.namedetails["name:en"] ?? airport.name;
        this.lat = Number(airport.lat);
        this.lon = Number(airport.lon);
        this.elev = airport.extratags.ele !== undefined ? Number(airport.extratags.ele) : null;
    }
}
