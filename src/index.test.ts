import { AirportTest } from "./lib/pattern/Airport.test.js";
import { AviationWeatherApiTest } from "./lib/general/AviationWeatherApi.test.js";
import { DateYielderTest } from "./lib/general/DateYielder.test.js";
import { DegreeTest } from "./lib/general/Degree.test.js";
import { FormatterTest } from "./lib/general/Formatter.test.js";
import { AeroflyMissionAutofillTest } from "./lib/general/AeroflyMissionAutofill.test.js";
import { GeoJsonLocationsTest, GeoJsonLocationTest } from "./lib/hems/GeoJsonLocations.test.js";
import { MarkdownTest } from "./lib/general/Markdown.test.js";
import { OpenStreetMapApiTest } from "./lib/general/OpenStreetMapApi.test.js";
import { LocalTimeTest } from "./lib/general/LocalTime.test.js";

new AirportTest();
await AviationWeatherApiTest.init();
new DateYielderTest();
new DegreeTest();
new FormatterTest();
new AeroflyMissionAutofillTest();
new GeoJsonLocationsTest();
new GeoJsonLocationTest();
new MarkdownTest();
await OpenStreetMapApiTest.init();
new LocalTimeTest();

process.exit();
