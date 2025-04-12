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
  liveries: {
    aeroflyCode: string;
    name: string;
  }[];
};

export type AeroflyAircraft = AeroflyAircraftBasic & {
  callsign: string;
  type: "S" | "G" | "H" | "U" | "W" | null;
  hasNoRadioNav: boolean;
  runwayTakeoff: number | null;
  runwayLanding: number | null;
};

/**
 * @see https://www.icao.int/publications/doc8643/pages/search.aspx
 */
export const AeroflyAircraftCollection: AeroflyAircraftBasic[] = [
  {
    name: "A319",
    nameFull: "Airbus A319-115",
    icaoCode: "A319",
    tags: [
      "airplane",
      "airliner",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "winglets",
      "pushback",
    ],
    approachAirspeedKts: 142,
    cruiseAltitudeFt: 32000,
    cruiseSpeedKts: 453,
    maximumRangeNm: 3747,
    aeroflyCode: "a319",
    liveries: [],
  },
  {
    name: "A320",
    nameFull: "Airbus A320-214",
    icaoCode: "A320",
    tags: [
      "airplane",
      "airliner",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "winglets",
      "pushback",
    ],
    approachAirspeedKts: 142,
    cruiseAltitudeFt: 32000,
    cruiseSpeedKts: 453,
    maximumRangeNm: 3321,
    aeroflyCode: "a320",
    liveries: [],
  },
  {
    name: "A321",
    nameFull: "Airbus A321-213",
    icaoCode: "A321",
    tags: [
      "airplane",
      "airliner",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "winglets",
      "pushback",
    ],
    approachAirspeedKts: 145,
    cruiseAltitudeFt: 32000,
    cruiseSpeedKts: 453,
    maximumRangeNm: 3186,
    aeroflyCode: "a321",
    liveries: [],
  },
  {
    name: "A350-1000",
    nameFull: "Airbus A350-1000",
    icaoCode: "A35K",
    tags: [
      "airplane",
      "airliner",
      "widebody",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "winglets",
      "pushback",
    ],
    approachAirspeedKts: 151,
    cruiseAltitudeFt: 37000,
    cruiseSpeedKts: 488,
    maximumRangeNm: 8909,
    aeroflyCode: "a350_1000",
    liveries: [],
  },
  {
    name: "A380",
    nameFull: "Airbus A380-800",
    icaoCode: "A388",
    tags: [
      "airplane",
      "airliner",
      "widebody",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "pushback",
    ],
    approachAirspeedKts: 142,
    cruiseAltitudeFt: 36000,
    cruiseSpeedKts: 517,
    maximumRangeNm: 8207,
    aeroflyCode: "a380",
    liveries: [],
  },
  {
    name: "Antares 21E",
    nameFull: "Antares 21 Electro",
    icaoCode: "LAE1",
    tags: [
      "airplane",
      "glider",
      "flaps",
      "retractable_gear",
      "tailgear",
      "winglets",
      "winch_hook",
      "tow_hook",
      "retractable_engine",
      "self_launch",
      "electro",
    ],
    approachAirspeedKts: 65,
    cruiseAltitudeFt: 8202,
    cruiseSpeedKts: 81,
    maximumRangeNm: 313,
    aeroflyCode: "antares",
    liveries: [],
  },
  {
    name: "ASG 29",
    nameFull: "Schleicher ASG 29-18m",
    icaoCode: "AS29",
    tags: ["airplane", "glider", "flaps", "retractable_gear", "tailgear", "winglets", "winch_hook", "tow_hook"],
    approachAirspeedKts: 54,
    cruiseAltitudeFt: 8202,
    cruiseSpeedKts: 76,
    maximumRangeNm: 0,
    aeroflyCode: "asg29",
    liveries: [],
  },
  {
    name: "ASK 21",
    nameFull: "Schleicher ASK 21",
    icaoCode: "AS21",
    tags: ["airplane", "glider", "aerobatic", "gear", "winch_hook", "tow_hook"],
    approachAirspeedKts: 57,
    cruiseAltitudeFt: 4921,
    cruiseSpeedKts: 59,
    maximumRangeNm: 0,
    aeroflyCode: "ask21",
    liveries: [],
  },
  {
    name: "Baron 58",
    nameFull: "Beechcraft Baron 58",
    icaoCode: "BE58",
    tags: ["airplane", "general_aviation", "piston", "flaps", "retractable_gear", "autopilot"],
    approachAirspeedKts: 90,
    cruiseAltitudeFt: 11000,
    cruiseSpeedKts: 202,
    maximumRangeNm: 1229,
    aeroflyCode: "b58",
    liveries: [],
  },
  {
    name: "B737-500",
    nameFull: "Boeing 737-500",
    icaoCode: "B735",
    tags: [
      "airplane",
      "airliner",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "pushback",
    ],
    approachAirspeedKts: 125,
    cruiseAltitudeFt: 33000,
    cruiseSpeedKts: 490,
    maximumRangeNm: 2808,
    aeroflyCode: "b737",
    liveries: [],
  },
  {
    name: "B737-900ER",
    nameFull: "Boeing 737-900ER",
    icaoCode: "B739",
    tags: [
      "airplane",
      "airliner",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "pushback",
    ],
    approachAirspeedKts: 144,
    cruiseAltitudeFt: 37000,
    cruiseSpeedKts: 453,
    maximumRangeNm: 2948,
    aeroflyCode: "b737_900",
    liveries: [],
  },
  {
    name: "B737 MAX 9",
    nameFull: "Boeing 737 MAX 9",
    icaoCode: "B39M",
    tags: [
      "airplane",
      "airliner",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "pushback",
    ],
    approachAirspeedKts: 144,
    cruiseAltitudeFt: 37000,
    cruiseSpeedKts: 453,
    maximumRangeNm: 3548,
    aeroflyCode: "b737_max9",
    liveries: [],
  },
  {
    name: "B747-400",
    nameFull: "Boeing 747-400",
    icaoCode: "B744",
    tags: [
      "airplane",
      "airliner",
      "widebody",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "winglets",
      "pushback",
    ],
    approachAirspeedKts: 145,
    cruiseAltitudeFt: 34000,
    cruiseSpeedKts: 492,
    maximumRangeNm: 7262,
    aeroflyCode: "b747",
    liveries: [],
  },
  {
    name: "B777F",
    nameFull: "Boeing 777F",
    icaoCode: "B77F",
    tags: [
      "airplane",
      "airliner",
      "widebody",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "pushback",
    ],
    approachAirspeedKts: 147,
    cruiseAltitudeFt: 41000,
    cruiseSpeedKts: 482,
    maximumRangeNm: 9750,
    aeroflyCode: "b777f",
    liveries: [],
  },
  {
    name: "B777-300ER",
    nameFull: "Boeing 777-300ER",
    icaoCode: "B77W",
    tags: [
      "airplane",
      "airliner",
      "widebody",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "pushback",
    ],
    approachAirspeedKts: 145,
    cruiseAltitudeFt: 41000,
    cruiseSpeedKts: 482,
    maximumRangeNm: 7370,
    aeroflyCode: "b777_300er",
    liveries: [],
  },
  {
    name: "B787-10",
    nameFull: "Boeing 787-10 Dreamliner",
    icaoCode: "B78X",
    tags: [
      "airplane",
      "airliner",
      "widebody",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "pushback",
    ],
    approachAirspeedKts: 150,
    cruiseAltitudeFt: 40000,
    cruiseSpeedKts: 482,
    maximumRangeNm: 6425,
    aeroflyCode: "b787",
    liveries: [],
  },
  {
    name: "Bf 109E",
    nameFull: "Messerschmitt Bf 109E",
    icaoCode: "ME09",
    tags: ["airplane", "fighter", "historical", "military", "piston", "flaps", "retractable_gear", "tailgear"],
    approachAirspeedKts: 94,
    cruiseAltitudeFt: 13123,
    cruiseSpeedKts: 309,
    maximumRangeNm: 432,
    aeroflyCode: "bf109e",
    liveries: [],
  },
  {
    name: "Cessna 172",
    nameFull: "Cessna 172 SP Skyhawk",
    icaoCode: "C172",
    tags: ["airplane", "general_aviation", "trainer", "piston", "flaps", "gear", "autopilot"],
    approachAirspeedKts: 62,
    cruiseAltitudeFt: 8000,
    cruiseSpeedKts: 130,
    maximumRangeNm: 1031,
    aeroflyCode: "c172",
    liveries: [],
  },
  {
    name: "King Air",
    nameFull: "Beechcraft King Air C90 GTx",
    icaoCode: "BE9L",
    tags: ["airplane", "general_aviation", "executive", "turboprop", "flaps", "retractable_gear", "autopilot"],
    approachAirspeedKts: 100,
    cruiseAltitudeFt: 18000,
    cruiseSpeedKts: 272,
    maximumRangeNm: 1192,
    aeroflyCode: "c90gtx",
    liveries: [],
  },
  {
    name: "Camel",
    nameFull: "Sopwith F.1 Camel",
    icaoCode: "CAML",
    tags: ["airplane", "fighter", "historical", "military", "piston", "gear", "tailgear"],
    approachAirspeedKts: 45,
    cruiseAltitudeFt: 9843,
    cruiseSpeedKts: 100,
    maximumRangeNm: 124,
    aeroflyCode: "camel",
    liveries: [],
  },
  {
    name: "Concorde",
    nameFull: "Aérospatiale/BAC Concorde",
    icaoCode: "CONC",
    tags: [
      "airplane",
      "airliner",
      "historical",
      "jet",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "autothrottle",
      "flaps",
      "pushback",
    ],
    approachAirspeedKts: 165,
    cruiseAltitudeFt: 55000,
    cruiseSpeedKts: 1177,
    maximumRangeNm: 3900,
    aeroflyCode: "concorde",
    liveries: [],
  },
  {
    name: "CRJ-900LR",
    nameFull: "Bombardier CRJ-900LR",
    icaoCode: "CRJ9",
    tags: [
      "airplane",
      "airliner",
      "regional",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "winglets",
      "pushback",
    ],
    approachAirspeedKts: 125,
    cruiseAltitudeFt: 38000,
    cruiseSpeedKts: 470,
    maximumRangeNm: 1550,
    aeroflyCode: "crj900",
    liveries: [],
  },
  {
    name: "Dr.I",
    nameFull: "Fokker Dr.I",
    icaoCode: "DR1",
    tags: ["airplane", "fighter", "historical", "military", "piston", "gear", "tailgear"],
    approachAirspeedKts: 49,
    cruiseAltitudeFt: 9843,
    cruiseSpeedKts: 100,
    maximumRangeNm: 162,
    aeroflyCode: "dr1",
    liveries: [],
  },
  {
    name: "DR400",
    nameFull: "Robin DR400",
    icaoCode: "DR40",
    tags: ["airplane", "general_aviation", "piston", "flaps", "gear", "autopilot"],
    approachAirspeedKts: 62,
    cruiseAltitudeFt: 5991,
    cruiseSpeedKts: 167,
    maximumRangeNm: 586,
    aeroflyCode: "dr400",
    liveries: [],
  },
  {
    name: "EC135",
    nameFull: "Eurocopter EC135-T1",
    icaoCode: "EC35",
    tags: ["helicopter", "turboshaft", "vertical_takeoff"],
    approachAirspeedKts: 60,
    cruiseAltitudeFt: 9000,
    cruiseSpeedKts: 135,
    maximumRangeNm: 343,
    aeroflyCode: "ec135",
    liveries: [],
  },
  {
    name: "Extra 330",
    nameFull: "Extra 330 LX",
    icaoCode: "E300",
    tags: ["airplane", "general_aviation", "aerobatic", "piston", "gear", "tailgear"],
    approachAirspeedKts: 90,
    cruiseAltitudeFt: 9843,
    cruiseSpeedKts: 220,
    maximumRangeNm: 459,
    aeroflyCode: "extra330",
    liveries: [],
  },
  {
    name: "F-15E",
    nameFull: "McDonnell Douglas F-15E Strike Eagle",
    icaoCode: "F15",
    tags: ["airplane", "military", "fighter", "jet", "flaps", "retractable_gear", "autopilot", "autothrottle"],
    approachAirspeedKts: 140,
    cruiseAltitudeFt: 40000,
    cruiseSpeedKts: 1458,
    maximumRangeNm: 3100,
    aeroflyCode: "f15e",
    liveries: [],
  },
  {
    name: "F/A-18C",
    nameFull: "McDonnell Douglas F/A-18C Hornet",
    icaoCode: "F18",
    tags: [
      "airplane",
      "military",
      "fighter",
      "jet",
      "flaps",
      "retractable_gear",
      "catapult_hook",
      "catch_hook",
      "wingfold",
      "autopilot",
      "autothrottle",
    ],
    approachAirspeedKts: 135,
    cruiseAltitudeFt: 40000,
    cruiseSpeedKts: 1034,
    maximumRangeNm: 1080,
    aeroflyCode: "f18",
    liveries: [],
  },
  {
    name: "Corsair",
    nameFull: "Vought F4U Corsair",
    icaoCode: "CORS",
    tags: [
      "airplane",
      "fighter",
      "historical",
      "military",
      "piston",
      "flaps",
      "retractable_gear",
      "tailgear",
      "catch_hook",
      "wingfold",
    ],
    approachAirspeedKts: 105,
    cruiseAltitudeFt: 20000,
    cruiseSpeedKts: 389,
    maximumRangeNm: 930,
    aeroflyCode: "f4u",
    liveries: [],
  },
  {
    name: "Ju 52",
    nameFull: "Junkers Ju 52/3m",
    icaoCode: "JU52",
    tags: ["airplane", "airliner", "historical", "piston", "flaps", "gear", "tailgear"],
    approachAirspeedKts: 65,
    cruiseAltitudeFt: 19685,
    cruiseSpeedKts: 136,
    maximumRangeNm: 1080,
    aeroflyCode: "ju52",
    liveries: [],
  },
  {
    name: "Jungmeister",
    nameFull: "Bücker Bü-133 Jungmeister",
    icaoCode: "BU33",
    tags: ["airplane", "general_aviation", "aerobatic", "historical", "piston", "gear", "tailgear"],
    approachAirspeedKts: 55,
    cruiseAltitudeFt: 13123,
    cruiseSpeedKts: 119,
    maximumRangeNm: 270,
    aeroflyCode: "jungmeister",
    liveries: [],
  },
  {
    name: "Learjet 45",
    nameFull: "Bombardier Learjet 45",
    icaoCode: "LJ45",
    tags: [
      "airplane",
      "general_aviation",
      "executive",
      "jet",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
    ],
    approachAirspeedKts: 120,
    cruiseAltitudeFt: 41000,
    cruiseSpeedKts: 486,
    maximumRangeNm: 1710,
    aeroflyCode: "lj45",
    liveries: [],
  },
  {
    name: "MB-339",
    nameFull: "Aermacchi MB-339",
    icaoCode: "M339",
    tags: ["airplane", "military", "fighter", "trainer", "jet", "flaps", "retractable_gear"],
    approachAirspeedKts: 120,
    cruiseAltitudeFt: 25000,
    cruiseSpeedKts: 486,
    maximumRangeNm: 1188,
    aeroflyCode: "mb339",
    liveries: [],
  },
  {
    name: "P-38",
    nameFull: "Lockheed P-38 Lightning",
    icaoCode: "P38",
    tags: ["airplane", "fighter", "historical", "military", "piston", "flaps", "retractable_gear"],
    approachAirspeedKts: 109,
    cruiseAltitudeFt: 20000,
    cruiseSpeedKts: 315,
    maximumRangeNm: 1031,
    aeroflyCode: "p38",
    liveries: [],
  },
  {
    name: "Pitts",
    nameFull: "Pitts S-2B",
    icaoCode: "PTS2",
    tags: ["airplane", "general_aviation", "aerobatic", "piston", "gear", "tailgear"],
    approachAirspeedKts: 90,
    cruiseAltitudeFt: 9843,
    cruiseSpeedKts: 132,
    maximumRangeNm: 216,
    aeroflyCode: "pitts",
    liveries: [],
  },
  {
    name: "Q400",
    nameFull: "Bombardier Dash-8 Q400",
    icaoCode: "DH8D",
    tags: [
      "airplane",
      "airliner",
      "regional",
      "turboprop",
      "flaps",
      "retractable_gear",
      "thrust_reverse",
      "autopilot",
      "pushback",
    ],
    approachAirspeedKts: 135,
    cruiseAltitudeFt: 24000,
    cruiseSpeedKts: 286,
    maximumRangeNm: 2808,
    aeroflyCode: "q400",
    liveries: [],
  },
  {
    name: "R22",
    nameFull: "Robinson R22 Beta II",
    icaoCode: "R22",
    tags: ["helicopter", "piston", "vertical_takeoff", "assistance"],
    approachAirspeedKts: 60,
    cruiseAltitudeFt: 6562,
    cruiseSpeedKts: 105,
    maximumRangeNm: 208,
    aeroflyCode: "r22",
    liveries: [],
  },
  {
    name: "Swift",
    nameFull: "Marganski Swift S1",
    icaoCode: "",
    tags: ["airplane", "glider", "aerobatic", "retractable_gear", "tailgear", "winch_hook", "tow_hook"],
    approachAirspeedKts: 63,
    cruiseAltitudeFt: 6562,
    cruiseSpeedKts: 65,
    maximumRangeNm: 0,
    aeroflyCode: "swift",
    liveries: [],
  },
  {
    name: "UH-60M",
    nameFull: "Sikorsky UH-60M Black Hawk",
    icaoCode: "H60",
    tags: ["helicopter", "turboshaft", "vertical_takeoff", "assistance"],
    approachAirspeedKts: 70,
    cruiseAltitudeFt: 9843,
    cruiseSpeedKts: 160,
    maximumRangeNm: 252,
    aeroflyCode: "uh60",
    liveries: [],
  },
];

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
