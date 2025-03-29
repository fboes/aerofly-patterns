import * as fs from "node:fs/promises";
import * as path from "node:path";
//import { fileURLToPath } from "node:url";
import { AeroflyAirRace } from "./AeroflyAirRace";

export class FileWriter {
  static async writeFile(app: AeroflyAirRace, saveDirectory: string) {
    if (app.configuration.directoryMode) {
      saveDirectory = `${saveDirectory}/data/airrace-${app.configuration.icaoCode}-${app.configuration.aircraft}`;
    }

    await fs.mkdir(path.join(saveDirectory, "missions"), { recursive: true });
    const promises = [fs.writeFile(`${saveDirectory}/missions/custom_missions_user.tmc`, app.buildCustomMissionTmc())];

    if (app.configuration.directoryMode) {
      promises.push(fs.writeFile(`${saveDirectory}/README.md`, app.buildReadmeMarkdown()));
      promises.push(
        fs.writeFile(
          `${saveDirectory}/${app.configuration.icaoCode}-${app.configuration.aircraft}.geojson`,
          app.buildGeoJson(),
        ),
      );
    }

    await Promise.all(promises);
  }
}
