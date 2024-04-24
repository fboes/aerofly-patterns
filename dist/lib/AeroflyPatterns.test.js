//@ts-check

import { strict as assert } from "node:assert";
import { AeroflyPatternsDescription } from "./AeroflyPatterns.js";

const startDate = new Date(Date.UTC(2024, 4, 15, 12, 0, 0));

console.group("getLocalDaytime");
{
  assert.strictEqual("noon", AeroflyPatternsDescription.getLocalDaytime(startDate, 0));
  assert.strictEqual("night", AeroflyPatternsDescription.getLocalDaytime(startDate, 12));
  assert.strictEqual("early morning", AeroflyPatternsDescription.getLocalDaytime(startDate, 5));
}
console.groupEnd();

console.group("getDirection");
{
  assert.strictEqual("north", AeroflyPatternsDescription.getDirection(0));
  assert.strictEqual("north", AeroflyPatternsDescription.getDirection(10));
  assert.strictEqual("north", AeroflyPatternsDescription.getDirection(22));
  assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(23));
  assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(24));
  assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(45));
  assert.strictEqual("north-east", AeroflyPatternsDescription.getDirection(46));
  assert.strictEqual("east", AeroflyPatternsDescription.getDirection(90));
  assert.strictEqual("north", AeroflyPatternsDescription.getDirection(359));
}
console.groupEnd();

console.group("getNumberString");
{
  assert.strictEqual("zero", AeroflyPatternsDescription.getNumberString(0));
  assert.strictEqual("ten", AeroflyPatternsDescription.getNumberString(10));
  assert.strictEqual("ten", AeroflyPatternsDescription.getNumberString(9.9));
  assert.strictEqual("ten", AeroflyPatternsDescription.getNumberString(10.1));
}
console.groupEnd();
