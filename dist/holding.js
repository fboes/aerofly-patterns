#!/usr/bin/env node
import { AeroflyHolding } from "./lib/holding/AeroflyHolding.js";
import { Configuration } from "./lib/holding/Configuration.js";
import { FileWriter } from "./lib/holding/FileWriter.js";
const configuration = new Configuration(process.argv);
if (configuration.help) {
    process.stdout
        .write(`\x1b[94mUsage: npx ${configuration.name}@latest aerofly-holding NAVAID_CODE [AFS_AIRCRAFT_CODE] [AFS_LIVERY_CODE] [...options]\x1b[0m
${configuration.helpText}

`);
    process.exit(0);
}
const app = await AeroflyHolding.init(configuration);
await FileWriter.writeFile(app, process.cwd());
console.log(`✅  Done with ${app.holdingFix?.fullName}`);
