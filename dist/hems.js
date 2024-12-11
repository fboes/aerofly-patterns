#!/usr/bin/env node

// @ts-check
import { AeroflyHems } from "./lib/hems/AeroflyHems.js";
import { Configuration } from "./lib/hems/Configuration.js";
import { FileWriter } from "./lib/hems/FileWriter.js";

const configuration = new Configuration(process.argv);

if (configuration.help) {
  process.stdout
    .write(`\x1b[94mUsage: npx -p ${configuration.name}@latest aerofly-hems GEOJSON_FILE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]\x1b[0m
${configuration.helpText}

`);
  process.exit(0);
}

const app = new AeroflyHems(configuration);
await app.build();
await FileWriter.writeFile(app, process.cwd());

console.log(`✅  Done`);
