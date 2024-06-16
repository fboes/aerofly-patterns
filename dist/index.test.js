// @ts-check
import { AirportTest } from "./lib/Airport.test.js";
import { AviationWeatherApiTest, AviationWeatherApiHelpersTest } from "./lib/AviationWeatherApi.test.js";
import { DateYielderTest } from "./lib/DateYielder.test.js";
import { DegreeTest } from "./lib/Degree.test.js";
import { FormatterTest } from "./lib/Formatter.test.js";

new AirportTest();
new AviationWeatherApiTest();
new AviationWeatherApiHelpersTest();
new DateYielderTest();
new DegreeTest();
new FormatterTest();
// process.exit();
