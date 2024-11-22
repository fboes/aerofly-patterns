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
    /**
     * @param {string} saveDirectory
     */
    if (app.configuration.directoryMode) {
      saveDirectory = `${saveDirectory}/data/HEMS-${app.configuration.environmentId}-${app.configuration.aircraft}`;

      await fs.mkdir(path.join(saveDirectory, "missions"), { recursive: true });
    }

    const promises = [fs.writeFile(`${saveDirectory}/missions/custom_missions_user.tmc`, app.buildCustomMissionTmc())];

    if (app.configuration.directoryMode) {
      promises.push(
        fs.writeFile(`${saveDirectory}/README.md`, app.buildMarkdown()),
        fs.cp(app.configuration.geoJsonFile, `${saveDirectory}/${app.configuration.environmentId}.geojson`),
      );
    }

    const poi_id = app.configuration.environmentId + "_emergency_sites";
    const poiDirectory = path.join(saveDirectory, "scenery/poi", app.getEmergencySitesFolderSuffix() + poi_id);
    const poiFallbackDirectory = path.join(poiDirectory, "fallback");

    if (!app.configuration.doNotGeneratePois) {
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
