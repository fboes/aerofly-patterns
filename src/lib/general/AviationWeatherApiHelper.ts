import { Point } from "@fboes/geojson";
import { AviationWeatherApi, AviationWeatherApiMetar, AviationWeatherNormalizedMetar } from "./AviationWeatherApi.js";
import { AeroflyMissionConditions, AeroflyMissionConditionsCloud } from "@fboes/aerofly-custom-missions";

export class AviationWeatherApiHelper {
  static async getWeather(airportCode: string, date: Date, position: Point | null = null) {
    let weatherAttempt = 0;
    let weathers: AviationWeatherApiMetar[] = [];

    if (airportCode) {
      weathers = await AviationWeatherApi.fetchMetar([airportCode], date);
    }

    while (position && weatherAttempt <= 5 && !weathers.length) {
      weathers = await AviationWeatherApi.fetchMetarByPosition(position, weatherAttempt * 10000, date);
      weatherAttempt++;
    }

    if (!weathers.length) {
      throw new Error(
        `No METAR information found for "${airportCode}" or position "${position ? position.coordinates.join(", ") : "unknown"}" on ${date.toISOString()}`,
      );
    }
    const weather = new AviationWeatherNormalizedMetar(weathers[0]);
    return weather;
  }

  static makeConditions(time: Date, weather: AviationWeatherNormalizedMetar) {
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
  }
}
