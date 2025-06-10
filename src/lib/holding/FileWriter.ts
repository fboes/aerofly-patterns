import { AeroflyHolding } from "./AeroflyHolding.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export class FileWriter {
  static async writeFile(app: AeroflyHolding, saveDirectory: string): Promise<void> {
    if (app.configuration.directoryMode) {
      saveDirectory = `${saveDirectory}/data/Holding_Pattern-${app.configuration.navaidCode}-${app.configuration.aircraft}`;
    }

    await fs.mkdir(path.join(saveDirectory, "missions"), { recursive: true });
    const promises = [fs.writeFile(`${saveDirectory}/missions/custom_missions_user.tmc`, app.buildCustomMissionTmc())];

    if (app.configuration.directoryMode) {
      promises.push(fs.writeFile(`${saveDirectory}/README.md`, app.buildReadmeMarkdown()));
      promises.push(
        fs.writeFile(
          `${saveDirectory}/${app.configuration.navaidCode}-${app.configuration.aircraft}.geojson`,
          app.buildGeoJson(),
        ),
      );
    }

    await Promise.all(promises);
  }
}
