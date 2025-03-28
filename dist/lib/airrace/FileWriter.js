import * as fs from "node:fs/promises";
import * as path from "node:path";
export class FileWriter {
    static async writeFile(app, saveDirectory) {
        if (app.configuration.directoryMode) {
            saveDirectory = `${saveDirectory}/data/airrace-${app.configuration.icaoCode}-${app.configuration.aircraft}`;
        }
        await fs.mkdir(path.join(saveDirectory, "missions"), { recursive: true });
        const promises = [fs.writeFile(`${saveDirectory}/missions/custom_missions_user.tmc`, app.buildCustomMissionTmc())];
        await Promise.all(promises);
    }
}
