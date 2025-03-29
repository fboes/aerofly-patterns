import { AeroflyMissionsList } from "@fboes/aerofly-custom-missions";
import { AeroflyAircraftFinder } from "../../data/AeroflyAircraft.js";
import { AviationWeatherApi, AviationWeatherNormalizedAirport } from "../general/AviationWeatherApi.js";
import { DateYielder } from "../general/DateYielder.js";
import { Scenario } from "./Scenario.js";
import { Feature, FeatureCollection, LineString, Point } from "@fboes/geojson";
export class AeroflyAirRace {
    constructor(configuration) {
        this.airport = null;
        this.aircraft = null;
        this.scenarios = [];
        this.nauticalTimezone = 0;
        this.configuration = configuration;
    }
    static async init(configuration) {
        const airport = await AviationWeatherApi.fetchAirports([configuration.icaoCode]);
        if (!airport.length) {
            throw new Error("No airport information from API");
        }
        const self = new AeroflyAirRace(configuration);
        self.airport = new AviationWeatherNormalizedAirport(airport[0]);
        self.nauticalTimezone = Math.round((self.airport.lon ?? 0) / 15);
        self.aircraft = AeroflyAircraftFinder.get(configuration.aircraft);
        const dateYielder = new DateYielder(self.configuration.numberOfMissions, self.nauticalTimezone);
        const dates = dateYielder.entries();
        let index = 0;
        for (const date of dates) {
            try {
                const scenario = await Scenario.init(self.configuration, self.aircraft, self.airport, date, index++);
                self.scenarios.push(scenario);
            }
            catch (error) {
                console.error(error);
            }
        }
        if (self.scenarios.length === 0) {
            throw Error("No scenarios generated, possibly because of missing weather data");
        }
        return self;
    }
    buildCustomMissionTmc() {
        return new AeroflyMissionsList(this.scenarios.map((s) => {
            return s.mission;
        })).toString();
    }
    buildReadmeMarkdown() {
        // TODO
        return `\
# README
`;
    }
    buildGeoJson() {
        const geoJson = new FeatureCollection();
        const scenario = this.scenarios.at(0);
        if (scenario == undefined) {
            return "";
        }
        this.scenarios.forEach((scenario, scenarioIndex) => {
            if (scenarioIndex > 0) {
                return;
            }
            const opacity = scenarioIndex === 0 ? 1 : 0.2;
            scenario.mission.checkpoints.forEach((cp, index) => {
                geoJson.addFeature(new Feature(new Point(cp.longitude, cp.latitude, cp.altitude), {
                    title: cp.name,
                    "marker-symbol": index === 0 ? "airfield" : index === scenario.mission.checkpoints.length - 1 ? "racetrack" : "triangle",
                    "fill-opacity": opacity,
                }));
            });
            geoJson.addFeature(new Feature(new LineString(scenario.mission.checkpoints.map((cp) => {
                return new Point(cp.longitude, cp.latitude, cp.altitude);
            })), {
                title: scenario.mission.title,
                stroke: "#ff1493",
                "stroke-opacity": opacity,
            }));
        });
        return JSON.stringify(geoJson, null, 2);
    }
}
