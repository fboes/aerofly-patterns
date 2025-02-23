import * as fs from "node:fs/promises";
import * as path from "node:path";
import { AeroflyPatterns } from "./AeroflyPatterns.js";

export class FileWriter {
  /**
   *
   * @param {AeroflyPatterns} app
   * @param {string} saveDirectory
   */
  static async writeFile(app: AeroflyPatterns, saveDirectory: string) {
    /**
     *
     * @param {string} saveDirectory
     */
    if (app.configuration.directoryMode) {
      saveDirectory = `${saveDirectory}/data/Landing_Challenges-${app.configuration.icaoCode}-${app.configuration.aircraft}`;

      await fs.mkdir(path.join(saveDirectory, "missions"), { recursive: true });
    }

    const promises = [fs.writeFile(`${saveDirectory}/missions/custom_missions_user.tmc`, app.buildCustomMissionTmc())];

    if (app.configuration.directoryMode) {
      promises.push(fs.writeFile(`${saveDirectory}/README.md`, app.buildReadmeMarkdown()));
      promises.push(
        fs.writeFile(
          `${saveDirectory}/${app.configuration.icaoCode}-${app.configuration.aircraft}.geojson`,
          JSON.stringify(app.buildGeoJson(), null, 2),
        ),
      );
    }

    await Promise.all(promises);
  }
}
