//@ts-check

import { strict as assert } from "node:assert";
import { DateYielder } from "./DateYielder.js";

export class DateYielderTest {
  constructor() {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));

    console.group("DateYielder with 1 entries");
    {
      const dateYielder = new DateYielder(1, 0, startDate);
      const dates = dateYielder.entries();
      for (const currentDate of dates) {
        //console.log(currentDate);
        assert.ok(currentDate);
        assert.equal(currentDate.toISOString(), startDate.toISOString());
      }
    }
    console.groupEnd();

    console.group("DateYielder with 5 entries");
    {
      const dateYielder = new DateYielder(5, 0, startDate);
      const dates = dateYielder.entries();
      for (const currentDate of dates) {
        //console.log(currentDate);
        assert.ok(currentDate);
        assert.notEqual(currentDate.toISOString(), startDate.toISOString());
        assert.strictEqual(2024, currentDate.getUTCFullYear());
        assert.strictEqual(4, currentDate.getUTCMonth());
      }
    }
    console.groupEnd();

    console.group("DateYielder with 12 entries");
    {
      const dateYielder = new DateYielder(12, 2, startDate);
      const dates = dateYielder.entries();
      for (const currentDate of dates) {
        //console.log(currentDate);
        assert.ok(currentDate);
        assert.notEqual(currentDate.toISOString(), startDate.toISOString());
      }
    }
    console.groupEnd();

    console.group("DateYielder with 24 entries");
    {
      const dateYielder = new DateYielder(24, 2, startDate);
      const dates = dateYielder.entries();
      for (const currentDate of dates) {
        //console.log(currentDate);
        assert.ok(currentDate);
        assert.notEqual(currentDate.toISOString(), startDate.toISOString());
      }
    }
    console.groupEnd();

    console.log(`✅ ${this.constructor.name} successful`);
  }
}
