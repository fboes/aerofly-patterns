var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Scenario_instances, _Scenario_getTitle, _Scenario_getDescription, _Scenario_makeOriginPosition, _Scenario_makeDestinationPosition, _Scenario_getCheckpoints, _Scenario_getEntryCheckpoints;
import { AeroflyMission, AeroflyMissionCheckpoint } from "@fboes/aerofly-custom-missions";
import { AeroflyMissionAutofill } from "../general/AeroflyMissionAutofill.js";
import { Vector } from "@fboes/geojson";
import { Units } from "../../data/Units.js";
import { Degree } from "../general/Degree.js";
import { HoldingPattern } from "./HoldingPattern.js";
import { Rand } from "../general/Rand.js";
import { Formatter } from "../general/Formatter.js";
import { AviationWeatherApiHelper } from "../general/AviationWeatherApiHelper.js";
/**
 * Represents a scenario for a holding pattern mission in Aerofly.
 * This class encapsulates the properties and methods needed to create a holding pattern mission,
 * including the mission title, description, conditions, origin and destination positions, and checkpoints.
 */
export class Scenario {
    static async init(holdingNavAid, configuration, aircraft, date, index = 0) {
        return new Scenario(configuration, aircraft, date, await AviationWeatherApiHelper.getWeather(configuration.airportCode, date, holdingNavAid.position), holdingNavAid, index);
    }
    constructor(configuration, aircraft, date, weather, holdingNavAid, index = 0) {
        this.configuration = configuration;
        this.aircraft = aircraft;
        this.date = date;
        this.weather = weather;
        this.holdingNavAid = holdingNavAid;
        this.index = index;
        _Scenario_instances.add(this);
        this.pattern = new HoldingPattern(configuration, holdingNavAid, aircraft);
        // Building the actual mission
        const bearing = Math.random() * 360;
        this.patternEntry = this.pattern.getEntry(bearing);
        const title = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getTitle).call(this, index);
        const description = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getDescription).call(this, this.pattern);
        const conditions = AviationWeatherApiHelper.makeConditions(this.date, this.weather);
        const origin = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_makeOriginPosition).call(this, this.pattern, bearing);
        const destination = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_makeDestinationPosition).call(this, this.pattern);
        const checkpoints = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getCheckpoints).call(this, this.pattern, this.patternEntry);
        this.mission = new AeroflyMission(title, {
            description,
            aircraft: {
                name: aircraft.aeroflyCode,
                icao: aircraft.icaoCode,
                livery: configuration.livery,
            },
            callsign: aircraft.callsign,
            flightSetting: "cruise",
            conditions,
            tags: ["holding", "pattern", "practice", "instrument"],
            origin,
            destination,
            checkpoints,
        });
        const describer = new AeroflyMissionAutofill(this.mission);
        this.mission.description = describer.description + "\n" + this.mission.description;
        this.mission.tags = this.mission.tags.concat(describer.tags);
        this.mission.distance = describer.distance;
        this.mission.duration = this.pattern.furtherClearanceInMin * 60;
        if (configuration.noGuides) {
            describer.removeGuides();
        }
    }
}
_Scenario_instances = new WeakSet(), _Scenario_getTitle = function _Scenario_getTitle(index) {
    return `HOLD #${index + 1}: ${this.holdingNavAid.name}${this.pattern.dmeDistanceNm > 0 ? ` with DME fix` : ""}`;
}, _Scenario_getDescription = function _Scenario_getDescription(pattern) {
    const direction = Formatter.getDirection(pattern.holdingAreaDirection);
    const dmeFix = pattern.dmeDistanceNm > 0 ? `the ${pattern.dmeDistanceNm} DME fix, ` : "";
    const radial = (this.holdingNavAid.type === "NDB" || this.holdingNavAid.type === "FIX" ? "inbound course " : "radial ") +
        String(Math.round(pattern.inboundHeading)).padStart(3, "0") +
        "°";
    const dmeInfo = pattern.dmeDistanceOutboundNm !== 0
        ? `${Math.abs(pattern.dmeDistanceNm - pattern.dmeDistanceOutboundNm)}-mile legs, `
        : "";
    const turnInfo = pattern.isLeftTurn ? "make left-hand turns, " : "make right-hand turns, ";
    const altitude = new Intl.NumberFormat("en-US").format(pattern.patternAltitudeFt);
    const efcDate = this.pattern.getFurtherClearance(this.date);
    const efcString = `${efcDate.getUTCHours().toString().padStart(2, "0")}:${efcDate
        .getUTCMinutes()
        .toString()
        .padStart(2, "0")}Z`;
    return `Hold ${direction} of ${dmeFix + this.holdingNavAid.fullName} \
on the ${radial}, \
${dmeInfo}\
${turnInfo}\
maintain ${altitude}'. \
Expect further clearance at ${efcString}.`;
}, _Scenario_makeOriginPosition = function _Scenario_makeOriginPosition(pattern, bearing) {
    const origin = pattern.holdingFix.getPointBy(new Vector(this.configuration.initialDistance * Units.metersPerNauticalMile, bearing));
    return {
        icao: this.weather.icaoId,
        latitude: origin.latitude,
        longitude: origin.longitude,
        alt: Rand.getRandomInt(this.configuration.minimumSafeAltitude, this.configuration.maximumAltitude) *
            100 *
            Units.feetPerMeter,
        dir: Degree(bearing + 180),
    };
}, _Scenario_makeDestinationPosition = function _Scenario_makeDestinationPosition(pattern) {
    return {
        icao: this.weather.icaoId,
        latitude: pattern.holdingFix.latitude,
        longitude: pattern.holdingFix.longitude,
        alt: pattern.patternAltitudeFt * Units.feetPerMeter,
        dir: pattern.inboundHeading,
    };
}, _Scenario_getCheckpoints = function _Scenario_getCheckpoints(pattern, patternEntry) {
    const turnMultiplier = pattern.isLeftTurn ? -1 : 1;
    const pointAfterFix = pattern.holdingFix.getPointBy(new Vector(pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue + 180)));
    const pointAbeam = pointAfterFix.getPointBy(new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue - turnMultiplier * 90)));
    const pointOutbound = pointAbeam.getPointBy(new Vector(pattern.legDistanceMeters + 2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue)));
    const pointInbound = pointOutbound.getPointBy(new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue + turnMultiplier * 90)));
    const moreCheckpointProperties = {
        altitude: pattern.patternAltitudeFt / Units.feetPerMeter,
        altitudeConstraint: true,
    };
    return [
        ...__classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getEntryCheckpoints).call(this, pattern, patternEntry),
        new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
            ...moreCheckpointProperties,
            frequency: this.holdingNavAid.frequency,
            flyOver: true,
        }),
        new AeroflyMissionCheckpoint(pattern.id + "-TURN", "waypoint", pointAfterFix.longitude, pointAfterFix.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id + "-ABEAM", "waypoint", pointAbeam.longitude, pointAbeam.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id + "-OUTBND", "waypoint", pointOutbound.longitude, pointOutbound.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id + "-INBND", "waypoint", pointInbound.longitude, pointInbound.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
            ...moreCheckpointProperties,
            frequency: this.holdingNavAid.frequency,
            flyOver: true,
        }),
    ];
}, _Scenario_getEntryCheckpoints = function _Scenario_getEntryCheckpoints(pattern, patternEntry) {
    if (patternEntry === "direct") {
        // Direct entry does not need extra checkpoints
        return [];
    }
    const turnMultiplier = pattern.isLeftTurn ? -1 : 1;
    const entryLegDistance = pattern.legDistanceMeters + pattern.turnRadiusMeters;
    const moreCheckpointProperties = {
        altitude: pattern.patternAltitudeFt / Units.feetPerMeter,
        altitudeConstraint: true,
    };
    if (patternEntry === "offset") {
        // Is offset / teardrop entry
        const pointAfterFix = pattern.holdingFix.getPointBy(new Vector(entryLegDistance, Degree(pattern.holdingAreaDirectionTrue + turnMultiplier * -30)));
        const pointInbound = pattern.holdingFix.getPointBy(new Vector(entryLegDistance, Degree(pattern.holdingAreaDirectionTrue)));
        return [
            new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
                ...moreCheckpointProperties,
                frequency: this.holdingNavAid.frequency,
                flyOver: true,
            }),
            new AeroflyMissionCheckpoint(pattern.id + "-OFF1", "waypoint", pointAfterFix.longitude, pointAfterFix.latitude, moreCheckpointProperties),
            new AeroflyMissionCheckpoint(pattern.id + "-OFF2", "waypoint", pointInbound.longitude, pointInbound.latitude, moreCheckpointProperties),
        ];
    }
    // Else it is a parallel entry
    const pointAlmostFix = pattern.holdingFix.getPointBy(new Vector(100, Degree(pattern.holdingAreaDirectionTrue + turnMultiplier * 90)));
    const pointTurnOutbound = pointAlmostFix.getPointBy(new Vector(entryLegDistance, Degree(pattern.holdingAreaDirectionTrue)));
    const pointTurnInbound = pointAlmostFix.getPointBy(new Vector(entryLegDistance, Degree(pattern.holdingAreaDirectionTrue + turnMultiplier * -30)));
    const pointInbound = pattern.holdingFix.getPointBy(new Vector(pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue)));
    return [
        new AeroflyMissionCheckpoint(pattern.id + "PRL0", "waypoint", pointAlmostFix.longitude, pointAlmostFix.latitude, {
            ...moreCheckpointProperties,
            frequency: this.holdingNavAid.frequency,
        }),
        new AeroflyMissionCheckpoint(pattern.id + "-PRL1", "waypoint", pointTurnOutbound.longitude, pointTurnOutbound.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id + "-PRL2", "waypoint", pointTurnInbound.longitude, pointTurnInbound.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id + "-PRL3", "waypoint", pointInbound.longitude, pointInbound.latitude, moreCheckpointProperties),
    ];
};
