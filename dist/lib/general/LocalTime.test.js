import { strict as assert } from "node:assert";
import { LocalTime } from "./LocalTime.js";
export class LocalTimeTest {
    constructor() {
        this.testTimeZones(0, "+00:00", "Z");
        this.testTimeZones(-1, "-01:00", "A");
        this.testTimeZones(-9, "-09:00", "I");
        this.testTimeZones(-10, "-10:00", "K");
        this.testTimeZones(-12, "-12:00", "M");
        this.testTimeZones(1, "+01:00", "N");
        this.testTimeZones(12, "+12:00", "Y");
    }
    testTimeZones(offsetHours, timeZone, nauticalZoneId) {
        const localTime = new LocalTime(new Date(), offsetHours);
        assert.deepStrictEqual(localTime.timeZone, timeZone);
        assert.deepStrictEqual(localTime.nauticalZoneId, nauticalZoneId);
        console.log(`✅ ${this.constructor.name}.testTimeZones(${offsetHours}) successful`);
    }
}
