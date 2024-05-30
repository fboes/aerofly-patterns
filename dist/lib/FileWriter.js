// @ts-check

import * as fs from "node:fs/promises";
import { AeroflyPatterns } from "./AeroflyPatterns.js";

export class FileWriter {
  /**
   *
   * @param {AeroflyPatterns} app
   * @param {string} saveDirectory
   */
  static async writeFile(app, saveDirectory) {
    /**
     *
     * @param {string} saveDirectory
     */
    if (app.configuration.directoryMode) {
      saveDirectory = `${saveDirectory}/data/Landing_Challenges-${app.configuration.icaoCode}-${app.configuration.aircraft}`;

      await fs.mkdir(saveDirectory, { recursive: true });
    }

    await Promise.all([
      fs.writeFile(`${saveDirectory}/custom_missions_user.tmc`, app.buildCustomMissionTmc()),
      !app.configuration.readme || fs.writeFile(`${saveDirectory}/README.md`, app.buildReadmeMarkdown()),
      !app.configuration.geojson ||
        fs.writeFile(
          `${saveDirectory}/${app.configuration.icaoCode}-${app.configuration.aircraft}.geojson`,
          JSON.stringify(app.buildGeoJson(), null, 2),
        ),
      // fs.writeFile(`${saveDirectory}/debug.json`, JSON.stringify(this, null, 2)),
    ]);
  }
}
