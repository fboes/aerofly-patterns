#!/usr/bin/env node

// @ts-check
import { AeroflyPatterns } from "./lib/AeroflyPatterns.js";

if (process.argv.indexOf("--help") !== -1) {
  process.stdout.write(`Usage: npx @fboes/aerofly-patterns [ICAO_AIRPORT_CODE] [AEROFLY_AIRCRAFT_CODE] [RP_RUNWAY,..]
Create landing pattern lessons for Aerofly FS 4.

Arguments:
  [ICAO_AIRPORT_CODE]       ICAO airport code which needs to be available in Aerofly FS 4.
                            Skip argument with "-"
  [AEROFLY_AIRCRAFT_CODE]   Internal aircraft code in Aerofly FS 4
                            Skip argument with "-"
  [RP_RUNWAY,..]            Comma-separated list of runway names with right-turn pattern
                            Skip argument with "-"
  [FOLDER_MODE]             If set to "1" will create files in a subdirectory instead of current directory.
  `);
  process.exit(0);
}

const app = new AeroflyPatterns(process.argv);
await app.build(process.cwd());
