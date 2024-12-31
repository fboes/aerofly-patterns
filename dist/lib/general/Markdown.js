// @ts-check

export class Markdown {
  /**
   * @param {string[][]} rows where the second row needs to be filled with `---`. You may need to quote `|` manually.
   * @returns {string}
   */
  static table(rows) {
    if (rows.length < 3) {
      throw Error("Not enough rows");
    }

    const lengths = [];
    rows.map((row) => {
      row.map((cell, colIndex) => {
        lengths[colIndex] = Math.max(cell.length, lengths[colIndex] ?? 3);
      });
    });

    return rows
      .map((row, rowIndex) => {
        const cells = row.map((cell, colIndex) => {
          if (rowIndex == 1) {
            return cell.replace(/^(\S).+(\S)$/, `$1${"".padEnd((lengths[colIndex] ?? 3) - 2, "-")}$2`);
          }

          // Center align
          if (rows[1][colIndex]?.startsWith(":") && rows[1][colIndex]?.endsWith(":")) {
            const padding = ((lengths[colIndex] ?? 2) - cell.length) / 2;
            if (padding > 0) {
              return " ".repeat(Math.floor(padding)) + cell + " ".repeat(Math.ceil(padding));
            }
          }

          // Left / right align
          return rows[1][colIndex]?.endsWith(":")
            ? cell.padStart(lengths[colIndex] ?? 3, " ")
            : cell.padEnd(lengths[colIndex] ?? 3, " ");
        });
        return `| ${cells.join(" | ")} |`;
      })
      .join("\n");
  }
}
