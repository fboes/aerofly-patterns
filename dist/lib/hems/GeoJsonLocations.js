var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _GeoJsonLocations_instances, _GeoJsonLocations_yieldRandomEmergencySite;
import { Point } from "@fboes/geojson";
import * as fs from "node:fs";
export class GeoJsonLocations {
    constructor(filename) {
        _GeoJsonLocations_instances.add(this);
        const rawData = fs.readFileSync(filename, "utf8");
        const featureCollection = JSON.parse(rawData);
        if (!featureCollection.type ||
            featureCollection.type !== "FeatureCollection" ||
            !featureCollection.features ||
            !Array.isArray(featureCollection.features)) {
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
        this.randomEmergencySite = __classPrivateFieldGet(this, _GeoJsonLocations_instances, "m", _GeoJsonLocations_yieldRandomEmergencySite).call(this);
    }
    get heliportsAndHospitals() {
        return (this.heliports ?? []).concat(this.hospitals?.filter((l) => {
            return l.markerSymbol !== GeoJsonLocations.MARKER_HELIPORT_HOSPITAL;
        }) ?? []);
    }
    getNearesHospital(location) {
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
    getRandHospital(butNot = null) {
        return this.getRandLocation(this.hospitals, butNot);
    }
    /**
     * @returns {GeoJsonLocation} heliports or hospitals with heliport
     */
    getRandHeliport() {
        return this.getRandLocation(this.heliports);
    }
    getRandLocation(locations, butNot = null) {
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
_GeoJsonLocations_instances = new WeakSet(), _GeoJsonLocations_yieldRandomEmergencySite = function
/**
 * Infinite generator of randomized `this.other`. On end of list will return to beginning, but keeping the random order.
 */
* _GeoJsonLocations_yieldRandomEmergencySite() {
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
};
GeoJsonLocations.MARKER_HOSPITAL = "hospital";
GeoJsonLocations.MARKER_HELIPORT = "heliport";
GeoJsonLocations.MARKER_HELIPORT_HOSPITAL = "hospital-JP";
export class GeoJsonLocation {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    constructor(json) {
        if (!json?.properties?.title) {
            throw Error(`Missing properties.title in GeoJSONFeature ${json.id}`);
        }
        if (!json?.geometry?.coordinates) {
            throw Error(`Missing properties.geometry.coordinates in GeoJSONFeature ${json.id}`);
        }
        this.type = json.type;
        this.id = json.id ?? null;
        this.coordinates = new Point(json.geometry.coordinates[0], json.geometry.coordinates[1], json.geometry.coordinates[2] ?? null);
        this.markerSymbol = json.properties["marker-symbol"] ?? "";
        this.title = json.properties.title;
        this.icaoCode = json.properties.icaoCode?.replace(/[-]+/g, "") || null;
        if (this.icaoCode !== null && !this.icaoCode.match(/^[a-zA-Z0-9-+]+$/)) {
            throw new Error("Invalid icaoCode: " + this.icaoCode);
        }
        this.direction = json.properties.direction ?? 0;
        this.approaches = json.properties.approaches ?? [];
        if (json.properties.approaches == undefined &&
            json.properties.direction !== undefined &&
            json.properties.icaoCode !== undefined) {
            this.approaches = [json.properties.direction, (json.properties.direction + 180) % 360];
        }
        this.url = json.properties.url ?? null;
    }
    get isHeliport() {
        return (this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT ||
            this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT_HOSPITAL);
    }
    get isHospital() {
        return (this.markerSymbol === GeoJsonLocations.MARKER_HOSPITAL ||
            this.markerSymbol === GeoJsonLocations.MARKER_HELIPORT_HOSPITAL);
    }
    /**
     * @returns {string}
     */
    get checkPointName() {
        if (this.icaoCode) {
            return this.icaoCode.toUpperCase();
        }
        const name = this.isHospital ? "HOSPITAL" : "EVAC";
        return ("W-" + name).toUpperCase().replace(/[^A-Z0-9-+]/, "");
    }
    clone(title = "", vector = null, altitudeChange = 0) {
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
