var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HoldingPattern_instances, _HoldingPattern_getHoldingFix, _HoldingPattern_getMaxPatternSpeedKts, _HoldingPattern_getTurnRadiusMeters, _HoldingPattern_getLegDistanceMeters, _HoldingPattern_getLegTimeMin;
import { Vector } from "@fboes/geojson";
import { Rand } from "../general/Rand.js";
import { Units } from "../../data/Units.js";
import { Degree } from "../general/Degree.js";
/**
 * Represents a holding pattern for an aircraft.
 * This class encapsulates the properties and calculations needed to define a holding pattern,
 * including inbound heading, turn direction, DME distance, pattern altitude, and leg time.
 *
 * @see https://www.faa.gov/air_traffic/publications/atpubs/aip_html/part2_enr_section_1.5.html
 */
export class HoldingPattern {
    constructor(configuration, holdingNavAid, aircraft) {
        _HoldingPattern_instances.add(this);
        this.inboundHeading =
            configuration.inboundHeading === -1 ? Rand.getRandomInt(0, 359) : configuration.inboundHeading;
        this.inboundHeadingTrue = this.inboundHeading + holdingNavAid.mag_dec;
        this.isLeftTurn = Math.random() < configuration.leftHandPatternProbability;
        this.dmeDistanceNm =
            Math.random() < configuration.dmeProcedureProbability && ["VORTAC", "VOR/DME"].includes(holdingNavAid.type)
                ? Rand.getRandomInt(configuration.minimumDmeDistance, configuration.maximumDmeDistance)
                : 0;
        this.dmeHoldingTowardNavaid =
            (this.dmeDistanceNm > 0 && Math.random() > configuration.dmeHoldingTowardNavaidProbability) ||
                holdingNavAid.type === "FIX";
        this.dmeDistanceOutboundNm =
            this.dmeDistanceNm > 0 || holdingNavAid.type === "FIX"
                ? this.dmeDistanceNm + (this.dmeHoldingTowardNavaid ? 4 : -4)
                : 0;
        this.patternAltitudeFt =
            Math.round(Rand.getRandomInt(configuration.minimumSafeAltitude, configuration.maximumAltitude) / 100) * 100;
        this.patternSpeedKts = Math.min(aircraft.cruiseSpeedKts + 10, __classPrivateFieldGet(this, _HoldingPattern_instances, "m", _HoldingPattern_getMaxPatternSpeedKts).call(this, aircraft, this.patternAltitudeFt));
        this.legTimeMin = __classPrivateFieldGet(this, _HoldingPattern_instances, "m", _HoldingPattern_getLegTimeMin).call(this, this.patternAltitudeFt);
        this.id =
            this.dmeDistanceNm <= 0 ? holdingNavAid.id : `${holdingNavAid.id}+${String(this.dmeDistanceNm).padStart(2, "0")}`;
        this.holdingFix = __classPrivateFieldGet(this, _HoldingPattern_instances, "m", _HoldingPattern_getHoldingFix).call(this, holdingNavAid);
        this.turnRadiusMeters = __classPrivateFieldGet(this, _HoldingPattern_instances, "m", _HoldingPattern_getTurnRadiusMeters).call(this, this.patternSpeedKts);
        this.legDistanceMeters = __classPrivateFieldGet(this, _HoldingPattern_instances, "m", _HoldingPattern_getLegDistanceMeters).call(this, this.patternSpeedKts, this.legTimeMin);
        this.holdingAreaDirection = Degree(this.inboundHeading + (this.dmeHoldingTowardNavaid ? 0 : 180));
        this.holdingAreaDirectionTrue = Degree(this.holdingAreaDirection + holdingNavAid.mag_dec);
        this.furtherClearanceInMin = Rand.getRandomInt(3, 5) * 5;
        //console.log(this);
    }
}
_HoldingPattern_instances = new WeakSet(), _HoldingPattern_getHoldingFix = function _HoldingPattern_getHoldingFix(holdingNavAid) {
    return holdingNavAid.position.getPointBy(new Vector(this.dmeDistanceNm * Units.metersPerNauticalMile, Degree(this.inboundHeadingTrue)));
}, _HoldingPattern_getMaxPatternSpeedKts = function _HoldingPattern_getMaxPatternSpeedKts(aircraft, patternAltitudeFt) {
    // TODO: Turbulence: 280
    if (aircraft.tags.includes("helicopter")) {
        return patternAltitudeFt <= 6000 ? 100 : 170;
    }
    if (patternAltitudeFt <= 6000) {
        return 200; // FAA
    }
    if (patternAltitudeFt <= 14000) {
        return 230; // ICAO / FAA
    }
    if (patternAltitudeFt <= 20000) {
        return 240; // ICAO
    }
    return 265; // ICAO
}, _HoldingPattern_getTurnRadiusMeters = function _HoldingPattern_getTurnRadiusMeters(patternSpeedKts) {
    return (patternSpeedKts / (20 * Math.PI * 3)) * Units.metersPerNauticalMile; // turn radius at 3 degrees per second
    //return (patternSpeedKts ** 2 / (11.26 * Math.tan(25 * (Math.PI / 180)))) * Units.metersPerNauticalMile; // turn radius at 25 degrees bank angle
}, _HoldingPattern_getLegDistanceMeters = function _HoldingPattern_getLegDistanceMeters(patternSpeedKts, legTimeMin) {
    if (this.dmeDistanceOutboundNm > 0) {
        return Math.abs(Math.sqrt((this.dmeDistanceOutboundNm * Units.metersPerNauticalMile) ** 2 - (this.turnRadiusMeters * 2) ** 2) -
            this.dmeDistanceNm * Units.metersPerNauticalMile);
    }
    return (patternSpeedKts / 60) * legTimeMin * Units.metersPerNauticalMile;
}, _HoldingPattern_getLegTimeMin = function _HoldingPattern_getLegTimeMin(patternAltitudeFt) {
    return patternAltitudeFt > 14000 ? 1.5 : 1;
};
