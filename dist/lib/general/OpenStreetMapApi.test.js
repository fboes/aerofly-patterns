import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { OpenStreetMapApi, OpenStreetMapApiAirport } from "./OpenStreetMapApi.js";
describe("OpenStreetMapApi", () => {
    it("should query and parse airport data correctly", async () => {
        const result = await OpenStreetMapApi.search("EDDG");
        //console.log(result);
        assert.ok(result.length > 0);
        const moreResult = new OpenStreetMapApiAirport(result[0]);
        //console.log(moreResult);
        assert.ok(moreResult);
    });
});
