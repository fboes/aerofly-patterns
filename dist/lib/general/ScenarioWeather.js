import { AviationWeatherNormalizedMetar, } from "./AviationWeatherApi.js";
export class ScenarioWeather {
    /**
     * @param {AviationWeatherApiMetar} weatherApiData
     */
    constructor(weatherApiData) {
        const weather = new AviationWeatherNormalizedMetar(weatherApiData);
        /**
         * @type {number} in degree
         */
        this.windDirection = weather.wdir ?? 0;
        /**
         * @type {number} in kts
         */
        this.windSpeed = weather.wspd;
        /**
         * @type {number} in kts
         */
        this.windGusts = weather.wgst ?? 0;
        /**
         * @type {number} in Statute Miles. Max is 15 for METAR values ending on a "+"
         */
        this.visibility = Math.min(15, weather.visib);
        this.clouds = weather.clouds.map((c) => {
            return new ScenarioWeatherCloud(c);
        });
        /**
         * @type {number} in °C
         */
        this.temperature = weather.temp;
    }
    /**
     * @returns {number} 0..1
     */
    get turbulenceStrength() {
        return Math.min(1, this.windSpeed / 80 + this.windGusts / 20);
    }
}
export class ScenarioWeatherCloud {
    /**
     * @param {AviationWeatherNormalizedCloud} cloud
     */
    constructor(cloud) {
        this.cloudCoverCode = cloud.cover;
        const cover = {
            CLR: [0, 0], // 0
            FEW: [1 / 8, 1 / 8], // 1/8 .. 2/8
            SCT: [2 / 8, 2 / 8], // 2/8 .. 4/8
            BKN: [4 / 8, 3 / 8], // 4/8 .. 7/8
            OVC: [7 / 8, 1 / 8], // 7/8 .. 1
        };
        const actualCover = cover[this.cloudCoverCode] ? cover[this.cloudCoverCode] : cover.CLR;
        /**
         * @type {number} 0..1
         */
        this.cloudCover = actualCover[0] + Math.random() * actualCover[1];
        /**
         * @type {number} in ft
         */
        this.cloudBase = cloud.base ?? 0;
    }
}
