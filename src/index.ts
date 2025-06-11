#!/usr/bin/env node

import { AeroflyPatterns } from "./lib/pattern/AeroflyPatterns.js";
import { Configuration } from "./lib/pattern/Configuration.js";
import { FileWriter } from "./lib/pattern/FileWriter.js";

const configuration = new Configuration(process.argv);

if (configuration.help) {
  process.stdout
    .write(`\x1b[94mUsage: npx ${configuration.name}@latest ICAO_AIRPORT_CODE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]\x1b[0m
${configuration.helpText}

`);
  process.exit(0);
}

const app = await AeroflyPatterns.init(configuration);
await FileWriter.writeFile(app, process.cwd());

console.log(`✅  Done with ${app.airport.name} (${app.airport.id})`);
