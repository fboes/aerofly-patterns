import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { LocalTime } from "./LocalTime.js";
describe("LocalTime", () => {
    it("should handle time zones correctly", () => {
        testTimeZones(0, "+00:00", "Z");
        testTimeZones(-1, "-01:00", "A");
        testTimeZones(-9, "-09:00", "I");
        testTimeZones(-10, "-10:00", "K");
        testTimeZones(-12, "-12:00", "M");
        testTimeZones(1, "+01:00", "N");
        testTimeZones(12, "+12:00", "Y");
    });
    const testTimeZones = (offsetHours, timeZone, nauticalZoneId) => {
        const localTime = new LocalTime(new Date(), offsetHours);
        assert.deepStrictEqual(localTime.timeZone, timeZone);
        assert.deepStrictEqual(localTime.nauticalZoneId, nauticalZoneId);
    };
});
