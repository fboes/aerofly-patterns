export interface AirportsRunway {
  id: string;
  isRightPattern?: boolean;
  isPreferred?: boolean;
  ilsFrequency?: number;
}

export interface AirportsAirport {
  runways: AirportsRunway[];
  minimumSafeAltitude?: number;
}

export const Airports: { [key: string]: AirportsAirport } = {
  EGJJ: {
    runways: [
      { id: "08", isRightPattern: true, ilsFrequency: 110.9, isPreferred: true },
      { id: "26", ilsFrequency: 110.3 },
    ],
    minimumSafeAltitude: 1_500,
  },
  KBDU: {
    runways: [
      { id: "26", isRightPattern: true },
      { id: "26G", isRightPattern: true },
    ],
  },
  KCEC: {
    runways: [{ id: "12", ilsFrequency: 108.7, isPreferred: true }],
    minimumSafeAltitude: 4_700,
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
  KJAC: { minimumSafeAltitude: 14_900, runways: [{ id: "19", ilsFrequency: 109.1, isPreferred: true }] },
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
  KSIY: {
    runways: [{ id: "35", isRightPattern: true, isPreferred: true }],
    minimumSafeAltitude: 9_600,
  },
  KSPG: {
    runways: [
      { id: "07", isRightPattern: true },
      { id: "36", isRightPattern: true },
      { id: "18", isPreferred: true },
    ],
    minimumSafeAltitude: 2_700,
  },
  KTPF: {
    runways: [
      { id: "04", isRightPattern: true },
      { id: "36", isRightPattern: true, isPreferred: true },
    ],
    minimumSafeAltitude: 2_700,
  },
  KWYS: { minimumSafeAltitude: 12_600, runways: [{ id: "01", ilsFrequency: 110.7, isPreferred: true }] },
};
