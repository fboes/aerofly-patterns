// @ts-check

/**
 * @typedef AirportsRunway
 * @type {object}
 * @property {string} id
 * @property {boolean} [isRightPattern]
 * @property {number} [ilsFrequency]
 */

/**
 * @type {{[key:string]: AirportsRunway[]}}
 */
export const Airports = {
  KBDU: [
    { id: "26", isRightPattern: true },
    { id: "26G", isRightPattern: true },
  ],
  KEYW: [{ id: "09", isRightPattern: true }],
  KHAF: [{ id: "30", isRightPattern: true }],
  KMVY: [
    { id: "24", isRightPattern: true, ilsFrequency: 108.7 },
    { id: "33", isRightPattern: true },
  ],
  KRTS: [
    { id: "26", isRightPattern: true },
    { id: "32", isRightPattern: true, ilsFrequency: 111.9 },
  ],
};
