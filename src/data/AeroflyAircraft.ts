export type AeroflyAircraftBasic = {
  name: string;
  nameFull: string;
  icaoCode: string;
  aeroflyCode: string;
  cruiseSpeedKts: number;
  approachAirspeedKts: number;
  cruiseAltitudeFt: number;
  maximumRangeNm: number;
  tags: string[];
};

export type AeroflyAircraft = AeroflyAircraftBasic & {
  callsign: string;
  type: "S" | "G" | "H" | "U" | "W" | null;
  hasNoRadioNav: boolean;
  runwayTakeoff: number | null;
  runwayLanding: number | null;
};

import AeroflyAircraftCollection from "@fboes/aerofly-data/data/aircraft.json" with { type: "json" };

export class AeroflyAircraftFinder {
  /**
   *
   * @param {string} aeroflyAircraftCode
   * @returns {AeroflyAircraft}
   */
  static get(aeroflyAircraftCode: string): AeroflyAircraft {
    const aircraft = AeroflyAircraftCollection.find((a) => {
      return a.aeroflyCode === aeroflyAircraftCode;
    });

    if (aircraft === undefined) {
      throw Error("Unknown aircraft: " + aeroflyAircraftCode);
    }

    let type: "S" | "G" | "H" | "U" | "W" | null = null;
    if (aircraft.tags.includes("helicopter")) {
      type = "H";
    }
    if (aircraft.tags.includes("glider")) {
      type = "G";
    }

    const callsign = aircraft.icaoCode
      ? "N" +
        String.fromCharCode(
          (aircraft.icaoCode.charCodeAt(1) % 9) + 49, // Numeric 1..9
          AeroflyAircraftFinder.randomizedLetter(aircraft.icaoCode.charCodeAt(0)),
          AeroflyAircraftFinder.randomizedLetter(aircraft.icaoCode.charCodeAt(3)),
          AeroflyAircraftFinder.randomizedLetter(aircraft.icaoCode.charCodeAt(2)),
        )
      : "N0XXX";
    const hasNoRadioNav = aircraft.tags.includes("historical") || aircraft.tags.includes("aerobatics");

    return {
      ...aircraft,
      type,
      callsign,
      hasNoRadioNav,
      ...AeroflyAircraftFinder.getRunwayLengths(aircraft),
    };
  }

  /**
   * Letterchar code, without I and O
   */
  static randomizedLetter(seed: number): number {
    let code = ((Number.isNaN(seed) ? 0 : seed) % 26) + 65;

    // Skip I and O
    if (code === 73 || code === 79) {
      code += 1;
    }
    return code;
  }

  static getRunwayLengths(aircraft: AeroflyAircraftBasic): {
    runwayTakeoff: number | null;
    runwayLanding: number | null;
  } {
    let runwayTakeoff: number | null = null;
    let runwayLanding: number | null = null;

    switch (aircraft.aeroflyCode) {
      case "a320":
        runwayTakeoff = 7186;
        runwayLanding = 4725;
        break;
      case "b58":
        runwayTakeoff = 1373;
        runwayLanding = 1440;
        break;
      case "c172":
        runwayTakeoff = 960;
        runwayLanding = 575;
        break;
      case "c90gtx":
        runwayTakeoff = 2557;
        runwayLanding = 3417;
        break;
      case "dr400":
        runwayTakeoff = 1150;
        runwayLanding = 820;
        break;
      case "f15e":
        runwayTakeoff = 985;
        runwayLanding = 1641;
        break;
      case "f18":
        runwayTakeoff = 1477;
        runwayLanding = 1313;
        break;
      case "jungmeister":
        runwayTakeoff = 380;
        runwayLanding = 374;
        break;
      case "lj45":
        runwayTakeoff = 4348;
        runwayLanding = 2658;
        break;
      case "mb339":
        runwayTakeoff = 1772;
        runwayLanding = 1542;
        break;
      default:
        if (aircraft.tags.includes("airliner")) {
          runwayTakeoff = 8000;
          runwayLanding = 6000;
        } else if (aircraft.tags.includes("helicopter")) {
          runwayTakeoff = 0;
          runwayLanding = 0;
        }
        break;
    }
    return { runwayTakeoff, runwayLanding };
  }
}
