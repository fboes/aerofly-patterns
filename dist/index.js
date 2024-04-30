// @ts-check
import { AeroflyPatterns } from "./lib/AeroflyPatterns.js";

const app = new AeroflyPatterns(process.argv);
await app.build(process.cwd());

//console.dir(app, { depth: null });
//console.log(JSON.stringify(app.buildGeoJson()));
