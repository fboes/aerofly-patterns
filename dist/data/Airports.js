// @ts-check

/**
 * @typedef AirportsRunway
 * @type {object}
 * @property {string} id
 * @property {boolean} [isRightPattern]
 * @property {boolean} [isPreferred] most active runways, will be used in case wind is indecisive
 * @property {number} [ilsFrequency]
 */

/**
 * @typedef AirportsAirport
 * @type {object}
 * @property {AirportsRunway[]} runways
 * @property {number} [minimumSafeAltitude] in feet
 */

/**
 * @type {{[key:string]: AirportsAirport}}
 */
export const Airports = {
  KBDU: {
    runways: [
      { id: "26", isRightPattern: true },
      { id: "26G", isRightPattern: true },
    ],
  },
  KEGE: {
    runways: [
      { id: "07", isRightPattern: true },
      { id: "25", ilsFrequency: 109.75, isPreferred: true },
    ],
    minimumSafeAltitude: 15_200,
  },
  KEYW: { runways: [{ id: "09", isRightPattern: true }] },
  KHAF: { runways: [{ id: "30", isRightPattern: true }] },
  KMVY: {
    runways: [
      { id: "24", isRightPattern: true, ilsFrequency: 108.7, isPreferred: true },
      { id: "33", isRightPattern: true },
    ],
  },
  KRTS: {
    runways: [
      { id: "26", isRightPattern: true },
      { id: "32", isRightPattern: true, ilsFrequency: 111.9, isPreferred: true },
    ],
    minimumSafeAltitude: 12_000,
  },
};
