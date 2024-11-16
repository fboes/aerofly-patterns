// @ts-check

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
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

    const promises = [fs.writeFile(`${saveDirectory}/custom_missions_user.tmc`, app.buildCustomMissionTmc())];

    const poi_id = "emergency_sites";
    const poiDirectory = path.join(saveDirectory, app.getEmergencySitesFolderSuffix() + poi_id);
    const poiFallbackDirectory = path.join(poiDirectory, "fallback");

    if (app.configuration.generatePois) {
      await fs.mkdir(poiDirectory, { recursive: true });

      promises.push(
        fs.writeFile(`${poiDirectory}/${poi_id}.toc`, app.buildEmergencySitesToc()),
        fs.writeFile(`${poiDirectory}/${poi_id}.tsl`, app.buildEmergencySitesTsl()),
        fs.cp(
          path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data/hems/fallback"),
          poiFallbackDirectory,
          { recursive: true },
        ),
      );
    }

    await Promise.all(promises);
  }
}
