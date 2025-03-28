#!/usr/bin/env node
import { AeroflyAirRace } from "./lib/airrace/AeroflyAirRace.js";
import { Configuration } from "./lib/airrace/Configuration.js";
import { FileWriter } from "./lib/airrace/FileWriter.js";
const configuration = new Configuration(process.argv);
if (configuration.help) {
    process.stdout
        .write(`\x1b[94mUsage: npx -p ${configuration.name}@latest aerofly-airrace ICAO_AIRPORT_CODE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]\x1b[0m
${configuration.helpText}

`);
    process.exit(0);
}
const app = await AeroflyAirRace.init(configuration);
await FileWriter.writeFile(app, process.cwd());
console.log(`✅  Off to the races`);
