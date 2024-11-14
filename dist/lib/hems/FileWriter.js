// @ts-check

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { AeroflyHems } from "./AeroflyHems.js";

export class FileWriter {
  /**
   *
   * @param {AeroflyHems} app
   * @param {string} saveDirectory
   */
  static async writeFile(app, saveDirectory) {
    const stationId = path.basename(app.configuration.geoJsonFile, path.extname(app.configuration.geoJsonFile));

    /**
     * @param {string} saveDirectory
     */
    if (app.configuration.directoryMode) {
      saveDirectory = `${saveDirectory}/data/HEMS-${stationId}-${app.configuration.aircraft}`;

      await fs.mkdir(saveDirectory, { recursive: true });
    }

    await Promise.all([fs.writeFile(`${saveDirectory}/custom_missions_user.tmc`, app.buildCustomMissionTmc())]);
  }
}
