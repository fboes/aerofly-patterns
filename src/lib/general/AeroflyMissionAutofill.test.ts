import { AeroflyMission } from "@fboes/aerofly-custom-missions";
import { strict as assert } from "node:assert";
import { AeroflyMissionAutofill } from "./AeroflyMissionAutofill.js";

export class AeroflyMissionAutofillTest {
  constructor() {
    this.checkConversion();
  }

  checkConversion() {
    const mission = new AeroflyMission("Test");
    const description = new AeroflyMissionAutofill(mission);
    const d = description.description;

    //console.log(d);
    assert.ok(d);

    mission.aircraft.name = "c172";
    assert.strictEqual(description.aircraftName, "C172");

    mission.aircraft.name = "f15e";
    assert.strictEqual(description.aircraftName, "F-15E");

    mission.aircraft.name = "b777_300er";
    assert.strictEqual(description.aircraftName, "B777-300ER");

    console.log(`✅ ${this.constructor.name}.checkConversion() successful`);
  }
}
