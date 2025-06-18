import { strict as assert } from "node:assert";
import { Point } from "@fboes/geojson";
import { AeroflyAircraftFinder } from "../../data/AeroflyAircraft.js";
import { Configuration } from "./Configuration.js";
import { HoldingPattern } from "./HoldingPattern.js";
import { HoldingPatternFix } from "./HoldingPatternFix.js";
export class HoldingPatternTest {
    constructor() {
        this.testHoldingPattern();
        this.testHoldingPatternDME();
    }
    testHoldingPattern() {
        const configuration = new Configuration([
            "",
            "",
            "--dme-probability=0",
            "--inbound-heading=0",
            "--left-probability=0",
        ]);
        assert.ok(configuration);
        assert.ok(configuration instanceof Configuration);
        assert.strictEqual(configuration.dmeProcedureProbability, 0);
        assert.strictEqual(configuration.leftHandPatternProbability, 0);
        const holdingPatternFix = new HoldingPatternFix("GND", "Test VOR", // Example name
        "VOR/DME", new Point(8.0, 50.0, 0), 0, 127.0);
        const aircraft = AeroflyAircraftFinder.get(configuration.aircraft);
        assert.ok(aircraft);
        const holdingPattern = new HoldingPattern(configuration, holdingPatternFix, aircraft);
        //console.log("Holding Pattern Test:", holdingPattern);
        assert.ok(holdingPattern);
        assert.strictEqual(holdingPattern.id, "GND");
        assert.ok(holdingPattern.turnRadiusMeters > 0);
        assert.ok(holdingPattern.inboundHeading >= 0 && holdingPattern.inboundHeading < 360);
        assert.ok(holdingPattern.inboundHeadingTrue >= 0 && holdingPattern.inboundHeadingTrue < 360);
        assert.ok(holdingPattern.isLeftTurn === true || holdingPattern.isLeftTurn === false);
        // ----
        assert.strictEqual(holdingPattern.getEntry(-1), "offset");
        assert.strictEqual(holdingPattern.getEntry(-45), "offset");
        assert.strictEqual(holdingPattern.getEntry(-90), "direct");
        assert.strictEqual(holdingPattern.getEntry(-180), "direct");
        assert.strictEqual(holdingPattern.getEntry(-270), "parallel");
        assert.strictEqual(holdingPattern.getEntry(-315), "parallel");
        assert.strictEqual(holdingPattern.getEntry(-360), "parallel");
        // ----
        configuration.leftHandPatternProbability = 1;
        const leftHandHoldingPattern = new HoldingPattern(configuration, holdingPatternFix, aircraft);
        assert.strictEqual(leftHandHoldingPattern.getEntry(1), "offset");
        assert.strictEqual(leftHandHoldingPattern.getEntry(45), "offset");
        assert.strictEqual(leftHandHoldingPattern.getEntry(90), "direct");
        assert.strictEqual(leftHandHoldingPattern.getEntry(180), "direct");
        assert.strictEqual(leftHandHoldingPattern.getEntry(270), "parallel");
        assert.strictEqual(leftHandHoldingPattern.getEntry(315), "parallel");
        assert.strictEqual(leftHandHoldingPattern.getEntry(360), "parallel");
        console.log(`✅ ${this.constructor.name}.testHoldingPattern successful`);
    }
    testHoldingPatternDME() {
        const configuration = new Configuration([
            "",
            "",
            "--dme-probability=1",
            "--inbound-heading=0",
            "--left-probability=0",
        ]);
        assert.ok(configuration);
        assert.ok(configuration instanceof Configuration);
        assert.strictEqual(configuration.dmeProcedureProbability, 1);
        //console.log(configuration);
        const holdingPatternFix = new HoldingPatternFix("GND", "Test VOR", // Example name
        "VOR/DME", new Point(8.0, 50.0, 0), 0, 127.0);
        const aircraft = AeroflyAircraftFinder.get(configuration.aircraft);
        assert.ok(aircraft);
        const holdingPattern = new HoldingPattern(configuration, holdingPatternFix, aircraft);
        //console.log("Holding Pattern Test:", holdingPattern);
        assert.ok(holdingPattern);
        assert.ok(holdingPattern.id.startsWith("GND+"));
        assert.ok(holdingPattern.turnRadiusMeters > 0);
        assert.ok(holdingPattern.inboundHeading >= 0 && holdingPattern.inboundHeading < 360);
        assert.ok(holdingPattern.inboundHeadingTrue >= 0 && holdingPattern.inboundHeadingTrue < 360);
        assert.ok(holdingPattern.isLeftTurn === true || holdingPattern.isLeftTurn === false);
        // ----
        configuration.dmeHoldingAwayFromNavaidProbability = 0;
        assert.strictEqual(holdingPattern.getEntry(-1), "offset");
        assert.strictEqual(holdingPattern.getEntry(-45), "offset");
        assert.strictEqual(holdingPattern.getEntry(-90), "direct");
        assert.strictEqual(holdingPattern.getEntry(-180), "direct");
        assert.strictEqual(holdingPattern.getEntry(-270), "parallel");
        assert.strictEqual(holdingPattern.getEntry(-315), "parallel");
        assert.strictEqual(holdingPattern.getEntry(-360), "parallel");
        // ----
        configuration.dmeHoldingAwayFromNavaidProbability = 1;
        const awayFromNavaidHoldingPattern = new HoldingPattern(configuration, holdingPatternFix, aircraft);
        assert.strictEqual(awayFromNavaidHoldingPattern.getEntry(180 - 1), "offset");
        assert.strictEqual(awayFromNavaidHoldingPattern.getEntry(180 - 45), "offset");
        assert.strictEqual(awayFromNavaidHoldingPattern.getEntry(180 - 90), "direct");
        assert.strictEqual(awayFromNavaidHoldingPattern.getEntry(180 - 180), "direct");
        assert.strictEqual(awayFromNavaidHoldingPattern.getEntry(180 - 270), "parallel");
        assert.strictEqual(awayFromNavaidHoldingPattern.getEntry(180 - 315), "parallel");
        assert.strictEqual(awayFromNavaidHoldingPattern.getEntry(180 - 360), "parallel");
        // ----
        configuration.dmeHoldingAwayFromNavaidProbability = 1;
        configuration.leftHandPatternProbability = 1;
        const leftHandAwayHoldingPattern = new HoldingPattern(configuration, holdingPatternFix, aircraft);
        assert.strictEqual(leftHandAwayHoldingPattern.getEntry(180 + 1), "offset");
        assert.strictEqual(leftHandAwayHoldingPattern.getEntry(180 + 45), "offset");
        assert.strictEqual(leftHandAwayHoldingPattern.getEntry(180 + 90), "direct");
        assert.strictEqual(leftHandAwayHoldingPattern.getEntry(180 + 180), "direct");
        assert.strictEqual(leftHandAwayHoldingPattern.getEntry(180 + 270), "parallel");
        assert.strictEqual(leftHandAwayHoldingPattern.getEntry(180 + 315), "parallel");
        assert.strictEqual(leftHandAwayHoldingPattern.getEntry(180 + 360), "parallel");
        // ----
        configuration.dmeHoldingAwayFromNavaidProbability = 0;
        configuration.leftHandPatternProbability = 1;
        const leftHandHoldingPattern = new HoldingPattern(configuration, holdingPatternFix, aircraft);
        assert.strictEqual(leftHandHoldingPattern.getEntry(1), "offset");
        assert.strictEqual(leftHandHoldingPattern.getEntry(45), "offset");
        assert.strictEqual(leftHandHoldingPattern.getEntry(90), "direct");
        assert.strictEqual(leftHandHoldingPattern.getEntry(180), "direct");
        assert.strictEqual(leftHandHoldingPattern.getEntry(270), "parallel");
        assert.strictEqual(leftHandHoldingPattern.getEntry(315), "parallel");
        assert.strictEqual(leftHandHoldingPattern.getEntry(360), "parallel");
        console.log(`✅ ${this.constructor.name}.testHoldingPatternDME successful`);
    }
}
