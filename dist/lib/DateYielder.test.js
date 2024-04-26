//@ts-check

import { strict as assert } from "node:assert";
import { DateYielder } from "./DateYielder.js";

export class DateYielderTest {
  constructor() {
    this.checkSingleEntry();
    this.checkMultipleEntries(5);
    this.checkMultipleEntries(12);
    this.checkMultipleEntries(24);
  }

  checkSingleEntry() {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));
    const dateYielder = new DateYielder(1, 0, startDate);
    const dates = dateYielder.entries();
    for (const currentDate of dates) {
      //console.log(currentDate);
      assert.ok(currentDate);
      assert.equal(currentDate.toISOString(), startDate.toISOString());
    }

    console.log(`✅ ${this.constructor.name}.checkSingleEntry successful`);
  }

  /**
   *
   * @param {number} entries
   */
  checkMultipleEntries(entries) {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));
    const dateYielder = new DateYielder(entries, 2, startDate);
    const dates = dateYielder.entries();
    for (const currentDate of dates) {
      //console.log(currentDate);
      assert.ok(currentDate);
      assert.notEqual(currentDate.toISOString(), startDate.toISOString());
    }

    console.log(`✅ ${this.constructor.name}.checkMultipleEntries(${entries}) successful`);
  }
}
