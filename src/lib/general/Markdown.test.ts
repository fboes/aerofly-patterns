import { strict as assert } from "node:assert";
import { Markdown } from "./Markdown.js";

export class MarkdownTest {
  constructor() {
    this.testTable();
  }

  testTable() {
    {
      const markdownTable = Markdown.table([
        ["Departure", "Duration", "Flight distance"],
        ["---", "--:", "--:"],
        ["EHAM", `${24} min`, `${56} km`],
      ]);

      assert.ok(markdownTable);
      //console.log(markdownTable);
    }

    {
      const markdownTable = Markdown.table([
        [`No`, `Local date¹`, `Local time¹`, `Wind`, `Clouds`, `Visibility`, `Runway`, `Aircraft position`],
        [`:-:`, `-----------`, `----------:`, `:--:`, `---`, `--:`, `---`, `---`],
        ...[1, 2, 3].map((index) => {
          return ["#" + String(index), "2024-05-19", "10:00", "N"];
        }),
      ]);

      assert.ok(markdownTable);
      //console.log(markdownTable);
    }

    console.log(`✅ ${this.constructor.name}.testTable successful`);
  }
}
