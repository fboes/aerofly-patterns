// @ts-check

import { strict as assert } from "node:assert";
import { Degree, degreeDifference, degreeToRad } from "./Degree.js";

export class DegreeTest {
  constructor() {
    this.checkDegrees();
    this.degreeToRad();
    this.degreeDifference();
  }

  checkDegrees() {
    assert.strictEqual(233, Degree(233));
    assert.strictEqual(358, Degree(-2));
    assert.strictEqual(6, Degree(366));
    assert.strictEqual(0, Degree(-360));

    console.log(`✅ ${this.constructor.name}.checkDegrees successful`);
  }

  degreeToRad() {
    assert.strictEqual(Math.PI, degreeToRad(180));
    assert.strictEqual((1 / 2) * Math.PI, degreeToRad(90));
    assert.strictEqual((1 / 4) * Math.PI, degreeToRad(45));
    assert.strictEqual(Math.PI / 180, degreeToRad(1));

    console.log(`✅ ${this.constructor.name}.degreeToRad successful`);
  }

  degreeDifference() {
    assert.strictEqual(90, degreeDifference(0, 90));
    assert.strictEqual(-90, degreeDifference(90, 0));

    assert.strictEqual(90, degreeDifference(270, 0));
    assert.strictEqual(-90, degreeDifference(0, 270));

    console.log(`✅ ${this.constructor.name}.degreeDifference successful`);
  }
}
