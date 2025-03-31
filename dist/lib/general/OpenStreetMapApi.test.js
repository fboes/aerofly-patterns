import { strict as assert } from "node:assert";
import { OpenStreetMapApi, OpenStreetMapApiAirport } from "./OpenStreetMapApi.js";
export class OpenStreetMapApiTest {
    static async init() {
        const self = new OpenStreetMapApiTest();
        await self.testQuery();
    }
    async testQuery() {
        const result = await OpenStreetMapApi.search("EDDG");
        //console.log(result);
        assert.ok(result.length > 0);
        const moreResult = new OpenStreetMapApiAirport(result[0]);
        console.log(moreResult);
        assert.ok(moreResult);
        console.log(`✅ ${this.constructor.name}.testQuery successful`);
    }
}
