import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { Formatter } from "./Formatter.js";

describe("Formatter", () => {
  it("should get local daytime correctly", () => {
    const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));
    assert.strictEqual("noon", Formatter.getLocalDaytime(startDate, 0));
    assert.strictEqual("night", Formatter.getLocalDaytime(startDate, 12));
    assert.strictEqual("late afternoon", Formatter.getLocalDaytime(startDate, 5));
  });

  it("should get direction correctly", () => {
    assert.strictEqual("north", Formatter.getDirection(0));
    assert.strictEqual("north", Formatter.getDirection(10));
    assert.strictEqual("north", Formatter.getDirection(22));
    assert.strictEqual("north-east", Formatter.getDirection(23));
    assert.strictEqual("north-east", Formatter.getDirection(24));
    assert.strictEqual("north-east", Formatter.getDirection(45));
    assert.strictEqual("north-east", Formatter.getDirection(46));
    assert.strictEqual("east", Formatter.getDirection(90));
    assert.strictEqual("north", Formatter.getDirection(359));
  });

  it("should get number string correctly", () => {
    assert.strictEqual("zero", Formatter.getNumberString(0));
    assert.strictEqual("ten", Formatter.getNumberString(10));
    assert.strictEqual("ten", Formatter.getNumberString(9.9));
    assert.strictEqual("ten", Formatter.getNumberString(10.1));
  });
});
