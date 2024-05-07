#!/usr/bin/env node

// @ts-check
import { AeroflyPatterns } from "./lib/AeroflyPatterns.js";

if (process.argv.indexOf("--help") !== -1) {
  process.stdout
    .write(`\x1b[94mUsage: npx @fboes/aerofly-patterns [ICAO_AIRPORT_CODE] [AEROFLY_AIRCRAFT_CODE] [RP_RUNWAY,..] [MINIMUM_SAFE_ALTITUDE] [FOLDER_MODE]\x1b[0m
Create landing pattern lessons for Aerofly FS 4.

Arguments:
\x1b[94m  [ICAO_AIRPORT_CODE]       \x1b[0mICAO airport code which needs to be available in Aerofly FS 4.
\x1b[94m  [AEROFLY_AIRCRAFT_CODE]   \x1b[0mInternal aircraft code in Aerofly FS 4.
\x1b[94m  [RP_RUNWAY,..]            \x1b[0mComma-separated list of runway names with right-turn pattern.
\x1b[94m  [MINIMUM_SAFE_ALTITUDE]   \x1b[0mMinimum altitude of aircraft, in 100ft. Will default to at least traffic pattern altitude.
\x1b[94m  [FOLDER_MODE]             \x1b[0mIf set to "1" will create files in a subdirectory instead of current directory.

If you need to skip a parameter, supply "-" and it will use the default value.
`);
  process.exit(0);
}

const app = new AeroflyPatterns(process.argv);
await app.build(process.cwd());
console.log("✅ Done");
