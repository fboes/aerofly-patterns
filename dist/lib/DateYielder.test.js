//@ts-check

import { strict as assert } from "node:assert";
import { DateYielder } from "./DateYielder.js";

export class DateYielderTest {
  constructor() {
    // All time zones
    for (let i = 12; i >= -12; i--) {
      this.checkEntries(1, i);
      this.checkEntries(5, i);
      this.checkEntries(12, i);
    }
  }

  /**
   *
   * @param {number} entries
   * @param {number} offsetHours
   */
  checkEntries(entries, offsetHours) {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 32, 0));
    const dateYielder = new DateYielder(entries, offsetHours, startDate);
    const dates = Array.from(dateYielder.entries());

    assert.strictEqual(dates.length, entries);
    dates.forEach((d) => {
      assert.strictEqual(d.getUTCFullYear(), 2024);
      assert.strictEqual(d.getUTCMonth(), 4);
      assert.ok(d.getUTCDate() <= 15);
      assert.ok(d.valueOf() <= startDate.valueOf());
    });
    //console.log(dateYielder.startDate, dates);

    console.log(`✅ ${this.constructor.name}.checkEntries(${entries}, ${offsetHours}) successful`);
  }
}
