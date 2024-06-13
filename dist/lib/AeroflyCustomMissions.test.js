// @ts-check

import { strict as assert } from "node:assert";
import * as AeroflyCustomMissions from "./AeroflyCustomMissions.js";

export class AeroflyMissionsListTest {
  constructor() {
    const checkpoints = [
      new AeroflyCustomMissions.AeroflyMissionCheckpoint("KCCR", "origin", 1, 1, 300),
      new AeroflyCustomMissions.AeroflyMissionCheckpoint("W2304", "waypoint", 1, 1, 300),
      new AeroflyCustomMissions.AeroflyMissionCheckpoint("KLAX", "destination", 1, 1, 300),
    ];

    const mission = new AeroflyCustomMissions.AeroflyMission("Test-Mission", checkpoints);
    mission.aircraft.name = "pitts";
    mission.conditions.clouds.push(new AeroflyCustomMissions.AeroflyMissionConditionsCloud(1, 1));

    const missionslist = new AeroflyCustomMissions.AeroflyMissionsList([mission, mission]);

    assert.deepStrictEqual(missionslist.missions.length, 2);
    //console.log(missionslist.toString());
    //console.log(JSON.stringify(missionslist, null, 2));

    console.log(`✅ ${this.constructor.name}.constructor successful`);
  }
}
