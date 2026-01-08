import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { Markdown } from "./Markdown.js";

describe("Markdown", () => {
  it("should create tables correctly", () => {
    const markdownTable = Markdown.table([
      ["Departure", "Duration", "Flight distance"],
      ["---", "--:", "--:"],
      ["EHAM", `${24} min`, `${56} km`],
    ]);

    assert.ok(markdownTable);
    //console.log(markdownTable);
  });

  it("should create complex tables correctly", () => {
    const markdownTable = Markdown.table([
      [`No`, `Local date¹`, `Local time¹`, `Wind`, `Clouds`, `Visibility`, `Runway`, `Aircraft position`],
      [`:-:`, `-----------`, `----------:`, `:--:`, `---`, `--:`, `---`, `---`],
      ...[1, 2, 3].map((index) => {
        return ["#" + String(index), "2024-05-19", "10:00", "N"];
      }),
    ]);

    assert.ok(markdownTable);
    //console.log(markdownTable);
  });
});
