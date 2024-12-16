// @ts-check

export class Markdown {
  /**
   * @param {string[][]} rows where the second row needs to be filled with `---`.
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

          return rows[1][colIndex]?.endsWith(":")
            ? cell.padStart(lengths[colIndex] ?? 2, " ")
            : cell.padEnd(lengths[colIndex] ?? 2, " ");
        });
        return `| ${cells.join(" | ")} |`;
      })
      .join("\n");
  }
}
