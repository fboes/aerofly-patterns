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

    await Promise.all(promises);
  }
}
