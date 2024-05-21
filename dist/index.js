#!/usr/bin/env node

// @ts-check
import { AeroflyPatterns } from "./lib/AeroflyPatterns.js";
import { Configuration } from "./lib/Configuration.js";

const configuration = new Configuration(process.argv);

if (configuration.help) {
  process.stdout
    .write(`\x1b[94mUsage: npx @fboes/aerofly-patterns ICAO_AIRPORT_CODE [AEROFLY_AIRCRAFT_CODE] [...options]\x1b[0m
Create landing pattern lessons for Aerofly FS 4.

Arguments:
\x1b[94m  ICAO_AIRPORT_CODE         \x1b[0mICAO airport code which needs to be available in Aerofly FS 4.
\x1b[94m  AEROFLY_AIRCRAFT_CODE     \x1b[0mInternal aircraft code in Aerofly FS 4.

Options:
${Configuration.argumentList()}

`);
  process.exit(0);
}

const app = new AeroflyPatterns(configuration);
await app.build(process.cwd());
console.log(`✅  Done with ${app.airport?.name} (${app.airport?.id})`);
