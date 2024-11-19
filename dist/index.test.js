// @ts-check
import { AirportTest } from "./lib/pattern/Airport.test.js";
import { AviationWeatherApiTest } from "./lib/general/AviationWeatherApi.test.js";
import { DateYielderTest } from "./lib/general/DateYielder.test.js";
import { DegreeTest } from "./lib/general/Degree.test.js";
import { FormatterTest } from "./lib/general/Formatter.test.js";
import AeroflyMissionDescriptionTest from "./lib/general/AeroflyMissionDescription.test.js";
import GeoJsonLocationsTest from "./lib/hems/GeoJsonLocations.test.js";

new AirportTest();
new AviationWeatherApiTest();
new DateYielderTest();
new DegreeTest();
new FormatterTest();
new AeroflyMissionDescriptionTest();
new GeoJsonLocationsTest();
process.exit();
