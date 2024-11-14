#!/usr/bin/env node

// @ts-check
import { AeroflyHems } from "./lib/hems/AeroflyHems.js";
import { Configuration } from "./lib/hems/Configuration.js";
import { FileWriter } from "./lib/hems/FileWriter.js";

const configuration = new Configuration(process.argv);

if (configuration.help) {
  process.stdout
    .write(`\x1b[94mUsage: npx -p @fboes/aerofly-patterns@latest aerofly-hems GEOJSON_FILE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]\x1b[0m
Create landing pattern lessons for Aerofly FS 4.

Arguments:
\x1b[94m  GEOJSON_FILE              \x1b[0mGeoJSON file containing possible mission locations.
\x1b[94m  AFS_AIRCRAFT_CODE         \x1b[0mInternal aircraft code in Aerofly FS 4. Defaults to "ec135".
\x1b[94m  AFS_LIVERY_CODE           \x1b[0mInternal aircraft code in Aerofly FS 4. Defaults to "adac".

Options:
${Configuration.argumentList()}

`);
  process.exit(0);
}

const app = new AeroflyHems(configuration);
await app.build();
await FileWriter.writeFile(app, process.cwd());

console.log(`✅  Done`);
