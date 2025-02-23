import { Point, Vector } from "@fboes/geojson";
import * as fs from "node:fs";

interface GeoJsonFeature {
  type: string;
  id: string;
  features: GeoJsonFeature[];
  properties: {
    title: string;
    "marker-symbol": string | null;
    icaoCode?: string;
    direction?: number;
    approaches?: number[];
    url?: string;
  };
  geometry: {
    coordinates: [number, number, number?];
    type: string;
  };
}

export class GeoJsonLocations {
  static MARKER_HOSPITAL = "hospital";
  static MARKER_HELIPORT = "heliport";
  static MARKER_HELIPORT_HOSPITAL = "hospital-JP";

  heliports: GeoJsonLocation[];
  hospitals: GeoJsonLocation[];
  other: GeoJsonLocation[];
  randomEmergencySite: Generator<GeoJsonLocation>;

  constructor(filename: string) {
    const rawData = fs.readFileSync(filename, "utf8");

    const featureCollection: GeoJsonFeature = JSON.parse(rawData);

    if (
      !featureCollection.type ||
      featureCollection.type !== "FeatureCollection" ||
      !featureCollection.features ||
      !Array.isArray(featureCollection.features)
    ) {
      throw Error("Missing FeatureCollection with features in GeoJSON file");
    }

    const pointFeatures = featureCollection.features
      .filter((f) => {
        return f.type === "Feature" && f.geometry.type === "Point";
      })
      .map((f) => {
        return new GeoJsonLocation(f);
      });

    if (pointFeatures.length === 0) {
      throw Error("Missing Features in GeoJson file");
    }

    /**
     * @type {GeoJsonLocation[]}
     */
    this.heliports = pointFeatures.filter((f) => {
      return f.isHeliport;
    });
    if (this.heliports.length === 0) {
      throw Error("Missing heliports in GeoJson file");
    }

    this.hospitals = pointFeatures.filter((f) => {
      return f.isHospital;
    });
    if (this.hospitals.length === 0) {
      this.hospitals = this.heliports;
    }

    /**
     * @type {GeoJsonLocation[]}
     */
    this.other = pointFeatures.filter((f) => {
      return !f.isHeliport && !f.isHospital;
    });
    if (this.other.length === 0) {
      throw Error("Missing mission locations in GeoJson file");
    }

    this.randomEmergencySite = this.#yieldRandomEmergencySite();
  }

  get heliportsAndHospitals(): GeoJsonLocation[] {
    return (this.heliports ?? []).concat(
      this.hospitals?.filter((l) => {
        return l.markerSymbol !== GeoJsonLocations.MARKER_HELIPORT_HOSPITAL;
      }) ?? [],
    );
  }

  /**
   * Infinite generator of randomized `this.other`. On end of list will return to beginning, but keeping the random order.
   */
  *#yieldRandomEmergencySite(): Generator<GeoJsonLocation> {
    let i = this.other.length;
    let j = 0;
    let temp;
    //const emergencySites = structuredClone(this.other);
    /**
     * @type {number[]}
     */
    const emergencySiteIndexes = [...Array(i).keys()];

    while (i--) {
      j = Math.floor(Math.random() * (i + 1));

      // swap randomly chosen element with current element
      temp = emergencySiteIndexes[i];
      emergencySiteIndexes[i] = emergencySiteIndexes[j];
      emergencySiteIndexes[j] = temp;
    }

    while (emergencySiteIndexes.length) {
      for (const locationIndex of emergencySiteIndexes) {
        yield this.other[locationIndex];
      }
    }
  }

  getNearesHospital(location: GeoJsonLocation): GeoJsonLocation {
    /** @type {number?} */
    let distance = null;
    let nearestLocation = this.hospitals[0];
    for (const testLocation of this.hospitals) {
      const vector = location.coordinates.getVectorTo(testLocation.coordinates);
      if (distance === null || vector.meters < distance) {
        nearestLocation = testLocation;
        distance = vector.meters;
      }
    }

    return nearestLocation;
  }

  getRandHospital(butNot: GeoJsonLocation | null = null): GeoJsonLocation {
    return this.getRandLocation(this.hospitals, butNot);
  }

  /**
   * @returns {GeoJsonLocation} heliports or hospitals with heliport
   */
  getRandHeliport(): GeoJsonLocation {
    return this.getRandLocation(this.heliports);
  }

  getRandLocation(locations: GeoJsonLocation[], butNot: GeoJsonLocation | null = null): GeoJsonLocation {
    if (butNot && locations.length < 2) {
      throw Error("Not enough locations to search for an alternate");
    }
    let location = null;
    do {
      location = locations[Math.floor(Math.random() * locations.length)];
    } while (butNot && location.title === butNot?.title);
    return location;
  }
}

export class GeoJsonLocation {
  type: string;
  id: string | null;
  coordinates: Point;
  markerSymbol: string;
  title: string;
  icaoCode: string | null;
  direction: number;
  approaches: number[];
  url: string | null;

  constructor(json: any) {
    if (!json?.properties?.title) {
      throw Error(`Missing properties.title in GeoJSONFeature ${json.id}`);
    }
    if (!json?.geometry?.coordinates) {
      throw Error(`Missing properties.geometry.coordinates in GeoJSONFeature ${json.id}`);
    }

    this.type = json.type;

    this.id = json.id ?? null;

    this.coordinates = new Point(
      json.geometry.coordinates[0],
      json.geometry.coordinates[1],
      json.geometry.coordinates[2] ?? null,
    );

    this.markerSymbol = json.properties["marker-symbol"] ?? "";
    this.title = json.properties.title;

    this.icaoCode = json.properties.icaoCode?.replace(/[-]+/g, "") || null;
    if (this.icaoCode !== null && !this.icaoCode.match(/^[a-zA-Z0-9-+]+$/)) {
      throw new Error("Invalid icaoCode: " + this.icaoCode);
    }

    this.direction = json.properties.direction ?? 0;
    this.approaches = json.properties.approaches ?? [];
    if (
      json.properties.approaches == undefined &&
      json.properties.direction !== undefined &&
      json.properties.icaoCode !== undefined
    ) {
      this.approaches = [json.properties.direction, (json.properties.direction + 180) % 360];
    }
    this.url = json.properties.url ?? null;
  }

  get isHeliport(): boolean {
    return (
      this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT ||
      this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT_HOSPITAL
    );
  }

  get isHospital(): boolean {
    return (
      this.markerSymbol === GeoJsonLocations.MARKER_HOSPITAL ||
      this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT_HOSPITAL
    );
  }

  /**
   * @returns {string}
   */
  get checkPointName() {
    if (this.icaoCode) {
      return this.icaoCode.toUpperCase();
    }
    let name = this.isHospital ? "HOSPITAL" : "EVAC";

    return ("W-" + name).toUpperCase().replace(/[^A-Z0-9-+]/, "");
  }

  clone(title: string = "", vector: Vector | null = null, altitudeChange: number = 0): GeoJsonLocation {
    const coordinates = vector ? this.coordinates.getPointBy(vector) : this.coordinates;
    let altitude = (coordinates.elevation ?? 0) * 3.28084; // in feet
    altitude += altitudeChange; // plus feet
    altitude = Math.ceil(altitude / 100) * 100; // rounded to the next 100ft
    altitude /= 3.28084; // in meters

    return new GeoJsonLocation({
      properties: {
        title: title,
        icaoCode: title,
      },
      geometry: {
        coordinates: [coordinates.longitude, coordinates.latitude, altitude],
      },
    });
  }
}
