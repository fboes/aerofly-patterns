var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Scenario_instances, _Scenario_getTitle, _Scenario_getDescription, _Scenario_getDmeInfo, _Scenario_makeConditions, _Scenario_makeOriginPosition, _Scenario_makeDestinationPosition, _Scenario_getCheckpoints;
import { AeroflyMission, AeroflyMissionCheckpoint, AeroflyMissionConditions, AeroflyMissionConditionsCloud, } from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi, AviationWeatherNormalizedMetar, } from "../general/AviationWeatherApi.js";
import { AeroflyMissionAutofill } from "../general/AeroflyMissionAutofill.js";
import { Vector } from "@fboes/geojson";
import { Units } from "../../data/Units.js";
import { Degree } from "../general/Degree.js";
import { HoldingPattern } from "./HoldingPattern.js";
import { Rand } from "../general/Rand.js";
import { Formatter } from "../general/Formatter.js";
/**
 * Represents a scenario for a holding pattern mission in Aerofly.
 * This class encapsulates the properties and methods needed to create a holding pattern mission,
 * including the mission title, description, conditions, origin and destination positions, and checkpoints.
 */
export class Scenario {
    static async init(holdingNavAid, configuration, aircraft, date, index = 0) {
        const getWeather = async () => {
            let weatherAttempt = 0;
            let weathers = [];
            while (weatherAttempt <= 5 && !weathers.length) {
                weathers = await AviationWeatherApi.fetchMetarByPosition(holdingNavAid.position, weatherAttempt * 10000, date);
                weatherAttempt++;
            }
            if (!weathers.length) {
                throw new Error("No METAR information near " + holdingNavAid.name + " found");
            }
            const weather = new AviationWeatherNormalizedMetar(weathers[0]);
            return weather;
        };
        const weather = await getWeather();
        const self = new Scenario(configuration, aircraft, date, weather, holdingNavAid, index);
        return self;
    }
    constructor(configuration, aircraft, date, weather, holdingNavAid, index = 0) {
        _Scenario_instances.add(this);
        this.configuration = configuration;
        this.aircraft = aircraft;
        this.date = date;
        this.weather = weather;
        this.holdingNavAid = holdingNavAid;
        this.index = index;
        this.pattern = new HoldingPattern(configuration, holdingNavAid, aircraft);
        // Building the actual mission
        const title = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getTitle).call(this, index);
        const description = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getDescription).call(this, this.pattern);
        const conditions = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_makeConditions).call(this, this.date, this.weather);
        const origin = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_makeOriginPosition).call(this, this.pattern);
        const destination = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_makeDestinationPosition).call(this, this.pattern);
        const checkpoints = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getCheckpoints).call(this, this.pattern);
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
            tags: ["holding"],
            origin,
            destination,
            checkpoints,
        });
        const describer = new AeroflyMissionAutofill(this.mission);
        this.mission.description = describer.description + "\n" + this.mission.description;
        this.mission.tags = this.mission.tags.concat(describer.tags);
        this.mission.distance = describer.distance;
        this.mission.duration = describer.calculateDuration(this.aircraft.cruiseSpeedKts);
        if (configuration.noGuides) {
            describer.removeGuides();
        }
    }
}
_Scenario_instances = new WeakSet(), _Scenario_getTitle = function _Scenario_getTitle(index) {
    return `HOLD #${index + 1}: ${this.holdingNavAid.name}${this.pattern.dmeDistanceNm > 0 ? ` with DME fix` : ""}`;
}, _Scenario_getDescription = function _Scenario_getDescription(pattern) {
    const direction = Formatter.getDirection(pattern.holdingAreaDirection);
    const radial = (this.holdingNavAid.type === "NDB" || this.holdingNavAid.type === "FIX" ? "inbound course " : "radial ") +
        String(Math.round(pattern.inboundHeading)).padStart(3, "0") +
        "°";
    const dmeInfo = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getDmeInfo).call(this, pattern);
    const turnInfo = pattern.isLeftTurn ? "make left-hand turns, " : "make right-hand turns, ";
    const altitude = new Intl.NumberFormat("en-US").format(pattern.patternAltitudeFt);
    return `Hold ${direction} of ${this.holdingNavAid.fullName} \
on the ${radial}, \
${dmeInfo}\
${turnInfo}\
maintain ${altitude}'.`;
}, _Scenario_getDmeInfo = function _Scenario_getDmeInfo(pattern) {
    if (pattern.dmeDistanceNm === 0 && pattern.dmeDistanceOutboundNm === 0) {
        return "";
    }
    if (pattern.dmeDistanceOutboundNm === 0) {
        return `at ${pattern.dmeDistanceNm} NM DME, `;
    }
    if (pattern.dmeDistanceNm === 0) {
        return `outbound leg ${pattern.dmeDistanceOutboundNm} NM DME, `;
    }
    return `between ${pattern.dmeDistanceNm} NM and ${pattern.dmeDistanceOutboundNm} NM DME, `;
}, _Scenario_makeConditions = function _Scenario_makeConditions(time, weather) {
    return new AeroflyMissionConditions({
        time,
        wind: {
            direction: weather.wdir ?? 0,
            speed: weather.wspd,
            gusts: weather.wgst ?? 0,
        },
        temperature: weather.temp,
        visibility_sm: Math.min(15, weather.visib),
        clouds: weather.clouds.map((c) => {
            return AeroflyMissionConditionsCloud.createInFeet(c.coverOctas / 8, c.base ?? 0);
        }),
    });
}, _Scenario_makeOriginPosition = function _Scenario_makeOriginPosition(pattern) {
    const bearing = Math.random() * 360;
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
}, _Scenario_getCheckpoints = function _Scenario_getCheckpoints(pattern) {
    const turnMultiplier = pattern.isLeftTurn ? -1 : 1;
    const pointAbeam = pattern.holdingFix.getPointBy(new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue - turnMultiplier * 90)));
    const pointOutbound = pointAbeam.getPointBy(new Vector(pattern.legDistanceMeters, Degree(pattern.holdingAreaDirectionTrue)));
    const pointInbound = pointOutbound.getPointBy(new Vector(2 * pattern.turnRadiusMeters, Degree(pattern.holdingAreaDirectionTrue + turnMultiplier * 90)));
    const moreCheckpointProperties = {
        altitude: pattern.patternAltitudeFt / Units.feetPerMeter,
        altitudeConstraint: true,
        flyOver: true,
    };
    return [
        new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
            ...moreCheckpointProperties,
            frequency: this.holdingNavAid.frequency,
        }),
        new AeroflyMissionCheckpoint(pattern.id + "-ABEAM", "waypoint", pointAbeam.longitude, pointAbeam.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id + "-OUTBND", "waypoint", pointOutbound.longitude, pointOutbound.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id + "-INBND", "waypoint", pointInbound.longitude, pointInbound.latitude, moreCheckpointProperties),
        new AeroflyMissionCheckpoint(pattern.id, "waypoint", pattern.holdingFix.longitude, pattern.holdingFix.latitude, {
            ...moreCheckpointProperties,
            frequency: this.holdingNavAid.frequency,
        }),
    ];
};
