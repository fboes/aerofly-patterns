var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AeroflyMissionAutofill_mission;
import { AeroflyMissionTargetPlane } from "@fboes/aerofly-custom-missions";
export class AeroflyMissionAutofill {
    constructor(mission) {
        _AeroflyMissionAutofill_mission.set(this, void 0);
        __classPrivateFieldSet(this, _AeroflyMissionAutofill_mission, mission, "f");
    }
    get title() {
        if (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.icao == __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").destination.icao) {
            return `Local flight at ${__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.icao}`;
        }
        return `From ${__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.icao} to ${__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").destination.icao}`;
    }
    get description() {
        let weatherAdjectives = this.weatherAdjectives;
        let weatherAdjectivesString = weatherAdjectives.length > 0 ? ` ${weatherAdjectives.join(", ")}` : "";
        return `Your ${this.aircraftName} is ${this.flightSetting} on this${weatherAdjectivesString} ${this.timeOfDay} with ${this.wind}.`;
    }
    get tags() {
        const tags = [];
        if (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").conditions.wind.speed >= 22) {
            tags.push("windy");
        }
        if (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").conditions.visibility_sm <= 3) {
            tags.push("low_visibility");
        }
        if (this.timeOfDay === "night") {
            tags.push("night");
        }
        if (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").flightSetting === "cold_and_dark") {
            tags.push("cold_and_dark");
        }
        else if (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").flightSetting === "before_start") {
            tags.push("before_start");
        }
        return tags;
    }
    get weatherAdjectives() {
        /**
         * @type {string[]}
         */
        const adjectives = [];
        const conditions = __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").conditions;
        if (conditions.wind.speed >= 48) {
            adjectives.push("stormy");
        }
        else if (conditions.wind.speed >= 34) {
            adjectives.push("very windy");
        }
        else if (conditions.wind.gusts >= 10) {
            // Gusty being more interesting as windy
            adjectives.push("gusty");
        }
        else if (conditions.wind.speed >= 22) {
            adjectives.push("windy");
        }
        if (conditions.visibility_sm <= 1) {
            adjectives.push("foggy");
        }
        else if (conditions.visibility_sm <= 3) {
            adjectives.push("misty");
        }
        else {
            switch (conditions.clouds[0]?.cover_code) {
                case "OVC":
                    adjectives.push("overcast");
                    break;
                case "BKN":
                    adjectives.push("cloudy");
                    break;
                case "CLR":
                    adjectives.push("clear");
                    break;
            }
        }
        return adjectives;
    }
    /**
     * @param {number} knots in knots
     * @returns {number} duration in seconds, considering aircraft flight setting
     */
    calculateDuration(knots) {
        let duration = (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").distance ?? 0) / (knots * (1852 / 3600));
        switch (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").flightSetting) {
            case "cold_and_dark":
                duration += 240;
                break;
            case "before_start":
                duration += 120;
                break;
            case "taxi":
                duration += 60;
                break;
        }
        return duration;
    }
    /**
     * Setting a target plane in around 1 meter distance in front of the aircraft.
     */
    removeGuides() {
        const directionRad = (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.dir * Math.PI) / 180;
        const offset = 0.00001;
        __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").finish = new AeroflyMissionTargetPlane(__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.longitude + Math.sin(directionRad) * offset, __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.latitude + Math.cos(directionRad) * offset, __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.dir);
    }
    /**
     * Will also add the bearing between the given checkpoints.
     * @returns {number} in meters
     */
    get distance() {
        /**
         * @type {AeroflyMissionCheckpoint?}
         */
        let lastCp = null;
        let distance = 0;
        for (const cp of __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").checkpoints) {
            if (lastCp !== null) {
                const vector = AeroflyMissionAutofill.getDistanceBetweenCheckpoints(lastCp, cp);
                distance += vector.distance;
                cp.direction = vector.bearing;
            }
            lastCp = cp;
        }
        return distance;
    }
    get nauticalTimeHours() {
        return (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").conditions.time.getUTCHours() + this.nauticalTimezoneOffset + 24) % 24;
    }
    get nauticalTimezoneOffset() {
        return Math.round((__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").origin.longitude ?? 0) / 15);
    }
    get timeOfDay() {
        const nauticalTimeHours = this.nauticalTimeHours;
        if (nauticalTimeHours < 5 || nauticalTimeHours >= 19) {
            return "night";
        }
        if (nauticalTimeHours < 8) {
            return "early morning";
        }
        if (nauticalTimeHours < 11) {
            return "morning";
        }
        if (nauticalTimeHours < 13) {
            return "noon";
        }
        if (nauticalTimeHours < 15) {
            return "afternoon";
        }
        if (nauticalTimeHours < 19) {
            return "late afternoon";
        }
        return "day";
    }
    get aircraftName() {
        switch (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").aircraft.name) {
            case "f15e":
            case "f18":
            case "mb339":
            case "p38":
            case "uh60":
                return __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").aircraft.name.toUpperCase().replace(/^(\D+)(\d+)/, "$1-$2");
            case "camel":
            case "concorde":
            case "jungmeister":
            case "pitts":
            case "swift":
                return __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").aircraft.name[0].toUpperCase() + String(__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").aircraft.name).slice(1);
            default:
                return __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").aircraft.name.toUpperCase().replace(/_/, "-");
        }
    }
    get flightSetting() {
        switch (__classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").flightSetting) {
            case "cold_and_dark":
                return "cold and dark";
            case "before_start":
                return "just before engine start";
            case "taxi":
                return "ready to taxi";
            case "takeoff":
                return "ready for take-off";
            case "cruise":
                return "cruising";
            case "approach":
                return "in approach configuration";
            case "landing":
                return "in landing configuration";
            case "pushback":
                return "ready for push-back";
            case "aerotow":
                return "towed by a tow-plane";
            case "winch_launch":
                return "ready for winch-launch";
            default:
                return "ready to go";
        }
    }
    get wind() {
        let wind = ``;
        const conditions = __classPrivateFieldGet(this, _AeroflyMissionAutofill_mission, "f").conditions;
        if (conditions.wind.speed < 1) {
            wind = `no wind`;
        }
        else if (conditions.wind.speed <= 5) {
            wind = `almost no wind`;
        }
        else {
            wind = `wind from ${String(conditions.wind.direction).padStart(3, "0")}° at ${conditions.wind.speed} kts`;
        }
        return wind;
    }
    /**
     *
     * @param {AeroflyMissionCheckpoint} lastCp
     * @param {AeroflyMissionCheckpoint} cp
     * @returns {{distance:number,bearing:number}} distance in meters
     */
    static getDistanceBetweenCheckpoints(lastCp, cp) {
        const lat1 = (lastCp.latitude / 180) * Math.PI;
        const lon1 = (lastCp.longitude / 180) * Math.PI;
        const lat2 = (cp.latitude / 180) * Math.PI;
        const lon2 = (cp.longitude / 180) * Math.PI;
        const dLon = lon2 - lon1;
        const dLat = lat2 - lat1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = 6_371_000 * c;
        return {
            distance,
            bearing,
        };
    }
}
_AeroflyMissionAutofill_mission = new WeakMap();
