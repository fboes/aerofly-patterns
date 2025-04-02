var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Scenario_instances, _Scenario_getTitle, _Scenario_makeConditions, _Scenario_makeOrigin, _Scenario_getCheckpoints, _Scenario_getRandomCheckpointCount, _Scenario_getRandomLegDistance, _Scenario_getRandomAltitude, _Scenario_roundAltitude, _Scenario_geRandomAngleChange, _Scenario_getRandomArbitrary, _Scenario_getRandomSign, _Scenario_getFinish;
import { AeroflyMission, AeroflyMissionCheckpoint, AeroflyMissionConditions, AeroflyMissionConditionsCloud, AeroflyMissionTargetPlane, } from "@fboes/aerofly-custom-missions";
import { AviationWeatherApi, AviationWeatherNormalizedMetar } from "../general/AviationWeatherApi.js";
import { Units } from "../../data/Units.js";
import { Point, Vector } from "@fboes/geojson";
import { AeroflyMissionAutofill } from "../general/AeroflyMissionAutofill.js";
export class Scenario {
    static async init(configuration, aircraft, airport, date, index = 0) {
        const weathers = await AviationWeatherApi.fetchMetar([configuration.icaoCode], date);
        if (!weathers.length) {
            throw new Error("No METAR information from API for " + configuration.icaoCode);
        }
        const weather = new AviationWeatherNormalizedMetar(weathers[0]);
        return new Scenario(configuration, aircraft, airport, date, weather, index);
    }
    constructor(configuration, aircraft, airport, date, weather, index = 0) {
        _Scenario_instances.add(this);
        this.date = date;
        this.aircraft = aircraft;
        if (airport.elev !== null) {
            if (configuration.minAltitude === 0) {
                configuration.minAltitude = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_roundAltitude).call(this, airport.elev * Units.feetPerMeter + 1500);
            }
            if (configuration.maxAltitude === 0) {
                configuration.maxAltitude = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_roundAltitude).call(this, airport.elev * Units.feetPerMeter + 3500);
            }
        }
        const title = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getTitle).call(this, index, airport);
        const conditions = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_makeConditions).call(this, date, weather);
        const origin = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_makeOrigin).call(this, airport, configuration);
        const destination = origin;
        const checkpoints = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getCheckpoints).call(this, origin, configuration);
        const finish = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getFinish).call(this, checkpoints);
        this.mission = new AeroflyMission(title, {
            aircraft: {
                name: aircraft.aeroflyCode,
                icao: aircraft.icaoCode,
                livery: configuration.livery,
            },
            callsign: aircraft.callsign,
            origin,
            destination,
            flightSetting: "cruise",
            conditions,
            checkpoints,
            tags: ["airrace"],
            finish,
        });
        const describer = new AeroflyMissionAutofill(this.mission);
        this.mission.description = describer.description.replace("cruising", "racing through the sky");
        this.mission.tags = this.mission.tags.concat(describer.tags);
        this.mission.distance = describer.distance;
        this.mission.duration = describer.calculateDuration(this.aircraft.cruiseSpeedKts);
    }
}
_Scenario_instances = new WeakSet(), _Scenario_getTitle = function _Scenario_getTitle(index, airport) {
    return `Air Race #${index + 1} at ${airport.name}`;
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
}, _Scenario_makeOrigin = function _Scenario_makeOrigin(airport, configuration) {
    return {
        icao: airport.icaoId ?? configuration.icaoCode,
        longitude: airport.lon,
        latitude: airport.lat,
        dir: (Math.random() * 360 + 360) % 360,
        alt: configuration.minAltitude / Units.feetPerMeter,
    };
}, _Scenario_getCheckpoints = function _Scenario_getCheckpoints(origin, configuration) {
    const numberOfLegs = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getRandomCheckpointCount).call(this, configuration);
    const checkpoints = [
        new AeroflyMissionCheckpoint(origin.icao, "origin", origin.longitude, origin.latitude, {
            altitude: origin.alt,
            altitudeConstraint: true,
            flyOver: true,
        }),
    ];
    let distance = 0;
    let direction = origin.dir;
    let position = new Point(origin.longitude, origin.latitude, origin.alt);
    for (let i = 0; i < numberOfLegs; i++) {
        distance = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getRandomLegDistance).call(this, configuration);
        if (i !== 0) {
            direction = direction + __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_geRandomAngleChange).call(this, configuration);
        }
        position = position.getPointBy(new Vector(distance, direction));
        position.elevation = __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_roundAltitude).call(this, __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getRandomAltitude).call(this, configuration));
        checkpoints.push(new AeroflyMissionCheckpoint(`CP-${i === numberOfLegs - 1 ? "FINISH" : String(i + 1)}`, "waypoint", position.longitude, position.latitude, {
            altitude: position.elevation,
            direction,
        }));
    }
    return checkpoints;
}, _Scenario_getRandomCheckpointCount = function _Scenario_getRandomCheckpointCount(configuration) {
    if (configuration.minCheckpointCount === configuration.maxCheckpointCount) {
        return configuration.minCheckpointCount;
    }
    const minCeiled = Math.ceil(configuration.minCheckpointCount);
    const maxFloored = Math.floor(configuration.maxCheckpointCount);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}, _Scenario_getRandomLegDistance = function _Scenario_getRandomLegDistance(configuration) {
    if (configuration.minLegDistance === configuration.maxLegDistance) {
        return configuration.minLegDistance * 1000;
    }
    return __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getRandomArbitrary).call(this, configuration.minLegDistance, configuration.maxLegDistance) * 1000;
}, _Scenario_getRandomAltitude = function _Scenario_getRandomAltitude(configuration) {
    if (configuration.minAltitude === configuration.maxAltitude) {
        return configuration.minAltitude / Units.feetPerMeter;
    }
    return __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getRandomArbitrary).call(this, configuration.minAltitude, configuration.maxAltitude) / Units.feetPerMeter;
}, _Scenario_roundAltitude = function _Scenario_roundAltitude(meters) {
    return (Math.ceil((meters * Units.feetPerMeter) / 100) * 100) / Units.feetPerMeter;
}, _Scenario_geRandomAngleChange = function _Scenario_geRandomAngleChange(configuration) {
    if (configuration.minAngleChange === configuration.maxAngleChange) {
        return configuration.minAngleChange;
    }
    return __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getRandomArbitrary).call(this, configuration.minAngleChange, configuration.maxAngleChange) * __classPrivateFieldGet(this, _Scenario_instances, "m", _Scenario_getRandomSign).call(this);
}, _Scenario_getRandomArbitrary = function _Scenario_getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}, _Scenario_getRandomSign = function _Scenario_getRandomSign() {
    return Math.random() < 0.5 ? -1 : 1;
}, _Scenario_getFinish = function _Scenario_getFinish(checkpoints) {
    const lastCp = checkpoints.at(-1);
    if (!lastCp) {
        return null;
    }
    return new AeroflyMissionTargetPlane(lastCp.longitude, lastCp.latitude, lastCp.direction ?? 0);
};
