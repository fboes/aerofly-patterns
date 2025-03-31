export type OpenStreetMapApiPlace = {
  /**
   * reference to the Nominatim internal database ID
   */
  place_id: string;
  lat: string;
  lon: string;

  name: string;

  /**
   * full comma-separated address
   */
  display_name: string;

  /**
   * key and value of the main OSM tag
   */
  class: string;

  /**
   * key and value of the main OSM tag
   */
  type: string;

  /**
   * dictionary with additional useful tags like website or maxspeed (only with extratags=1)
   */
  extratags: {
    /**
     * in meters
     */
    ele?: string;
  };

  /**
   * dictionary with full list of available names including ref etc.
   */
  namedetails: {
    icao?: string;
    name?: string;
    "name:en"?: string;
  };
};

/**
 * @see https://nominatim.org/release-docs/develop/api/Overview/
 */
export class OpenStreetMapApi {
  static async search(q: string, limit = 1): Promise<OpenStreetMapApiPlace[]> {
    return OpenStreetMapApi.doRequest(
      "/search",
      new URLSearchParams({
        q,
        format: "json",
        limit: String(limit),
        extratags: "1",
        namedetails: "1",
      }),
    );
  }

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  static async doRequest(route: string, query: URLSearchParams): Promise<any> {
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
  icaoId: string | null;
  name: string;
  lat: number;
  lon: number;

  /**
   * in meters
   */
  elev: number | null;

  constructor(airport: OpenStreetMapApiPlace) {
    this.icaoId = airport.namedetails.icao ?? null;
    this.name = airport.namedetails["name:en"] ?? airport.name;
    this.lat = Number(airport.lat);
    this.lon = Number(airport.lon);
    this.elev = airport.extratags.ele !== undefined ? Number(airport.extratags.ele) : null;
  }
}
