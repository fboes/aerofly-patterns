import { Vector } from "@fboes/geojson";
import { Rand } from "../general/Rand.js";
import { Units } from "../../data/Units.js";
import { Degree, degreeDifference } from "../general/Degree.js";
/**
 * Represents a holding pattern for an aircraft.
 * This class encapsulates the properties and calculations needed to define a holding pattern,
 * including inbound heading, turn direction, DME distance, pattern altitude, and leg time.
 *
 * @see https://www.faa.gov/air_traffic/publications/atpubs/aip_html/part2_enr_section_1.5.html
 */
export class HoldingPattern {
    id;
    inboundHeading;
    inboundHeadingTrue;
    isLeftTurn;
    /**
     * In nautical miles
     * This is the distance from the holding fix to the DME fix.
     */
    dmeDistanceNm;
    /**
     * In nautical miles
     */
    dmeDistanceOutboundNm;
    /**
     * Indicates if the DME procedure is flown towards the VOR (false) or away from it (true).
     */
    dmeHoldingAwayFromNavaid;
    /**
     * The direction of the holding pattern.
     */
    holdingAreaDirection;
    holdingAreaDirectionTrue;
    /**
     * Pattern altitude in feet MSL.
     * This is the altitude at which the aircraft should hold.
     */
    patternAltitudeFt;
    patternSpeedKts;
    /**
     * In minutes
     * This is the time the aircraft should hold on each leg of the holding pattern.
     * It is used to calculate the distance flown during the holding pattern.
     */
    legTimeMin;
    /**
     * The fix around which the holding pattern is built.
     * This is the Navaid that the aircraft will hold at, or in case of a DME procedure, the DME fix.
     */
    holdingFix;
    /**
     * The turn radius of the holding pattern in meters.
     */
    turnRadiusMeters;
    /**
     * The distance of the inbound leg in the holding pattern in meters.
     */
    legDistanceMeters;
    furtherClearanceInMin;
    constructor(configuration, holdingNavAid, aircraft) {
        this.inboundHeading =
            configuration.inboundHeading === -1 ? Rand.getRandomInt(0, 359) : configuration.inboundHeading;
        this.inboundHeadingTrue = this.inboundHeading + holdingNavAid.mag_dec;
        this.isLeftTurn = Math.random() < configuration.leftHandPatternProbability;
        this.dmeDistanceNm =
            Math.random() < configuration.dmeProcedureProbability && ["VORTAC", "VOR/DME"].includes(holdingNavAid.type)
                ? Rand.getRandomInt(configuration.minimumDmeDistance, configuration.maximumDmeDistance)
                : 0;
        this.dmeHoldingAwayFromNavaid =
            this.dmeDistanceNm > 0 && Math.random() <= configuration.dmeHoldingAwayFromNavaidProbability;
        this.dmeDistanceOutboundNm =
            this.dmeDistanceNm > 0 ? this.dmeDistanceNm + (this.dmeHoldingAwayFromNavaid ? -4 : 4) : 0;
        this.patternAltitudeFt =
            Math.round(Rand.getRandomInt(configuration.minimumHoldingAltitude, configuration.maximumHoldingAltitude) / 100) *
                100;
        this.patternSpeedKts = Math.min(aircraft.cruiseSpeedKts + 10, this._getMaxPatternSpeedKts(aircraft, this.patternAltitudeFt));
        this.legTimeMin = this._getLegTimeMin(this.patternAltitudeFt);
        this.id =
            this.dmeDistanceNm <= 0 ? holdingNavAid.id : `${holdingNavAid.id}+${String(this.dmeDistanceNm).padStart(2, "0")}`;
        this.holdingFix = this._getHoldingFix(holdingNavAid);
        this.turnRadiusMeters = this._getTurnRadiusMeters(this.patternSpeedKts);
        this.legDistanceMeters = this._getLegDistanceMeters(this.patternSpeedKts, this.legTimeMin);
        this.holdingAreaDirection = Degree(this.inboundHeading + (this.dmeHoldingAwayFromNavaid ? 0 : 180));
        this.holdingAreaDirectionTrue = Degree(this.holdingAreaDirection + holdingNavAid.mag_dec);
        this.furtherClearanceInMin = Rand.getRandomInt(3, 5) * 5;
        //console.log(this);
    }
    _getHoldingFix(holdingNavAid) {
        return holdingNavAid.position.getPointBy(new Vector(this.dmeDistanceNm * Units.metersPerNauticalMile, Degree(this.inboundHeadingTrue + 180)));
    }
    /**
     * @see https://www.code7700.com/holding.htm
     */
    _getMaxPatternSpeedKts(aircraft, patternAltitudeFt) {
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
    }
    /**
     * @see https://skybrary.aero/articles/holding-pattern
     * During entry and holding, pilots manually flying the aircraft are expected
     * to make all turns to achieve an average bank angle of at least 25˚ or
     * a rate of turn of 3˚ per second, whichever requires the lesser bank.
     */
    _getTurnRadiusMeters(patternSpeedKts) {
        return (patternSpeedKts / (20 * Math.PI * 3)) * Units.metersPerNauticalMile; // turn radius at 3 degrees per second
        //return (patternSpeedKts ** 2 / (11.26 * Math.tan(25 * (Math.PI / 180)))) * Units.metersPerNauticalMile; // turn radius at 25 degrees bank angle
    }
    _getLegDistanceMeters(patternSpeedKts, legTimeMin) {
        if (this.dmeDistanceOutboundNm !== 0) {
            return Math.abs(Math.sqrt((this.dmeDistanceOutboundNm * Units.metersPerNauticalMile) ** 2 - (this.turnRadiusMeters * 2) ** 2) -
                this.dmeDistanceNm * Units.metersPerNauticalMile);
        }
        return (patternSpeedKts / 60) * legTimeMin * Units.metersPerNauticalMile;
    }
    _getLegTimeMin(patternAltitudeFt) {
        return patternAltitudeFt > 14000 ? 1.5 : 1;
    }
    getEntry(bearing) {
        const delta = degreeDifference(this.holdingAreaDirectionTrue, bearing) * (this.isLeftTurn ? -1 : 1);
        if (delta >= 110) {
            return "offset";
        }
        if (delta <= -70) {
            return "parallel";
        }
        return "direct";
    }
    getFurtherClearance(date) {
        const furtherClearanceInMs = this.furtherClearanceInMin * 60 * 1000;
        return new Date(date.getTime() + furtherClearanceInMs);
    }
}
