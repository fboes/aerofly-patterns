// @ts-check

import { AeroflyMission } from "@fboes/aerofly-custom-missions";
import { strict as assert } from "node:assert";
import AeroflyMissionDescription from "./AeroflyMissionDescription.js";

export default class AeroflyMissionDescriptionTest {
  constructor() {
    this.checkConversion();
  }

  checkConversion() {
    const mission = new AeroflyMission("Test");
    const description = new AeroflyMissionDescription(mission);
    const d = description.description;

    //console.log(d);
    assert.ok(d);

    console.log(`✅ ${this.constructor.name}.checkConversion() successful`);
  }
}
