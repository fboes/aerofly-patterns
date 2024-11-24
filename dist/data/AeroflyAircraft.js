// @ts-check

/**
 * @typedef AeroflyAircraftBasic
 * @type {object}
 * @property {string} name of aircraft
 * @property {"S"|"G"|"H"|"U"|"W"?} type STOL, Glider, Helicopter, Ultralight, Water
 * @property {string} icaoCode
 * @property {string} aeroflyCode
 * @property {boolean} [hasNoRadioNav] if no VOR receiver is onboard
 */

/**
 * @typedef AeroflyAircraft
 * @type {object}
 * @property {string} name of aircraft
 * @property {"S"|"G"|"H"|"U"|"W"?} type STOL, Glider, Helicopter, Ultralight, Water
 * @property {string} icaoCode
 * @property {string} aeroflyCode
 * @property {string} callsign
 * @property {number} cruiseSpeed in kts
 * @property {number} [runwayTakeoff] length in feet
 * @property {number} [runwayLanding] length in feet
 * @property {boolean} [hasNoRadioNav] if no VOR receiver is onboard
 */

/**
 * @see https://www.icao.int/publications/doc8643/pages/search.aspx
 * @type {{[key:string]: AeroflyAircraft}}
 */
export const AeroflyAircrafts = {
  a320: {
    name: "Airbus A320",
    type: null,
    icaoCode: "A320",
    aeroflyCode: "a320",
    callsign: "LH321",
    cruiseSpeed: 447,
    runwayTakeoff: 7186,
    runwayLanding: 4725,
  },
  b58: {
    // https://beechcraft.txtav.com/en/baron-g58
    name: "Beechcraft Baron 58",
    type: null,
    icaoCode: "BE58",
    aeroflyCode: "b58",
    callsign: "N58EU",
    cruiseSpeed: 202,
    runwayTakeoff: 1373,
    runwayLanding: 1440,
  },
  c172: {
    // https://cessna.txtav.com/en/piston/cessna-skyhawk
    name: "Cessna 172",
    type: null,
    icaoCode: "C172",
    aeroflyCode: "c172",
    callsign: "N51911",
    cruiseSpeed: 124,
    runwayTakeoff: 960,
    runwayLanding: 575,
  },
  c90gtx: {
    name: "Beechcraft King Air C90",
    type: null,
    icaoCode: "BE9L",
    aeroflyCode: "c90gtx",
    callsign: "DIBYP",
    cruiseSpeed: 217,
    runwayTakeoff: 2557,
    runwayLanding: 3417,
  },
  concorde: {
    name: "Aérospatiale-BAC Concorde",
    type: null,
    icaoCode: "CONC",
    aeroflyCode: "concorde",
    callsign: "FBVFB",
    cruiseSpeed: 1165,
  },
  dr400: {
    name: "Robin DR 400",
    type: null,
    icaoCode: "DR40",
    aeroflyCode: "dr400",
    callsign: "HBJOA",
    cruiseSpeed: 140,
    runwayTakeoff: 1150,
    runwayLanding: 820,
  },
  ec135: {
    name: "Eurocopter EC135",
    type: "H",
    icaoCode: "EC35",
    aeroflyCode: "ec135",
    callsign: "CHX64",
    cruiseSpeed: 137,
    runwayTakeoff: 0,
    runwayLanding: 0,
  },
  f15e: {
    name: "McDonnell Douglas F-15E Strike Eagle",
    type: null,
    icaoCode: "F15",
    aeroflyCode: "f15e",
    callsign: "ASJ0494",
    cruiseSpeed: 570,
    runwayTakeoff: 985,
    runwayLanding: 1641,
  },
  f18: {
    name: "McDonnell Douglas F/A-18 Hornet",
    type: null,
    icaoCode: "F18H",
    aeroflyCode: "f18",
    callsign: "VVAC260",
    cruiseSpeed: 570,
    runwayTakeoff: 1477,
    runwayLanding: 1313,
  },
  jungmeister: {
    name: "Bücker Bü 133 Jungmeister",
    type: null,
    icaoCode: "BU33",
    aeroflyCode: "jungmeister",
    callsign: "HBMIZ",
    cruiseSpeed: 108,
    runwayTakeoff: 380,
    runwayLanding: 374,
    hasNoRadioNav: true,
  },
  lj45: {
    name: "Learjet 45",
    type: null,
    icaoCode: "LJ45",
    aeroflyCode: "lj45",
    callsign: "DCSDD",
    cruiseSpeed: 450,
    runwayTakeoff: 4348,
    runwayLanding: 2658,
  },
  mb339: {
    name: "Aermacchi MB-339",
    type: null,
    icaoCode: "M339",
    aeroflyCode: "mb339",
    callsign: "FPR456",
    cruiseSpeed: 350,
    runwayTakeoff: 1772,
    runwayLanding: 1542,
  },
  p38: {
    name: "Lockheed P-38",
    type: null,
    icaoCode: "P38",
    aeroflyCode: "p38",
    callsign: "N38BP",
    cruiseSpeed: 239,
    hasNoRadioNav: true,
  },
  pitts: {
    name: "Pitts Special S-2",
    type: null,
    icaoCode: "PTS2",
    aeroflyCode: "pitts",
    callsign: "DEUJS",
    cruiseSpeed: 152,
    hasNoRadioNav: true,
  },
  r22: {
    name: "Robinson R22",
    type: "H",
    icaoCode: "R22",
    aeroflyCode: "r22",
    callsign: "VHPHK",
    cruiseSpeed: 96,
    runwayTakeoff: 0,
    runwayLanding: 0,
  },
  uh60: {
    name: "Sikorsky UH-60 Black Hawk",
    type: "H",
    icaoCode: "H60",
    aeroflyCode: "uh60",
    callsign: "EVAC26212",
    cruiseSpeed: 152,
    runwayTakeoff: 0,
    runwayLanding: 0,
  },
};

/**
 * Incomplete aircraft data
 * @see https://www.icao.int/publications/doc8643/pages/search.aspx
 * @type {{[key:string]: AeroflyAircraftBasic}}
 */
const AeroflyAircraftsBasic = {
  a380: {
    name: "Airbus A380",
    type: null,
    icaoCode: "A388",
    aeroflyCode: "a380",
    // callsign: null,
    // cruiseSpeed: null,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  asg29: {
    name: "Schleicher ASG 29",
    type: "G",
    icaoCode: "AS29",
    aeroflyCode: "asg29",
    // callsign: null,
    // cruiseSpeed: null,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  b737: {
    name: "Boeing 737",
    type: null,
    icaoCode: "B735",
    aeroflyCode: "b737",
    // callsign: null,
    // cruiseSpeed: 450,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  b737_900: {
    name: "Boeing 737-900",
    type: null,
    icaoCode: "B739",
    aeroflyCode: "b737_900",
    // callsign: null,
    // cruiseSpeed: 450,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  b747: {
    name: "Boeing 747",
    type: null,
    icaoCode: "B744",
    aeroflyCode: "b747",
    // callsign: null,
    // cruiseSpeed: 450,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  b777_300er: {
    name: "Boeing 777",
    type: null,
    icaoCode: "B77W",
    aeroflyCode: "b777_300er",
    // callsign: null,
    // cruiseSpeed: 450,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  b787: {
    name: "Boeing 787 Dreamliner Dreamliner",
    type: null,
    icaoCode: "B78X",
    aeroflyCode: "b787",
    // callsign: null,
    // cruiseSpeed: 450,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  bf109e: {
    name: "Messerschmitt Bf 109",
    type: null,
    icaoCode: "ME09",
    aeroflyCode: "bf109e",
    // callsign: null,
    // cruiseSpeed: 320,
    // runwayTakeoff: null,
    // runwayLanding: null,
    hasNoRadioNav: true,
  },
  camel: {
    name: "Sopwith Camel",
    type: null,
    icaoCode: "CAML",
    aeroflyCode: "camel",
    // callsign: null,
    // cruiseSpeed: 98,
    // runwayTakeoff: null,
    // runwayLanding: null,
    hasNoRadioNav: true,
  },
  crj900: {
    name: "Bombardier Canadair Regional Jet",
    type: null,
    icaoCode: "CRJ9",
    aeroflyCode: "crj900",
    // callsign: null,
    // cruiseSpeed: null,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  dr1: {
    name: "Fokker Dr.I",
    type: null,
    icaoCode: "DR1",
    aeroflyCode: "dr1",
    // callsign: null,
    // cruiseSpeed: null,
    // runwayTakeoff: null,
    // runwayLanding: null,
    hasNoRadioNav: true,
  },
  f4u: {
    name: "Vought F4U Corsair",
    type: null,
    icaoCode: "CORS",
    aeroflyCode: "f4u",
    // callsign: null,
    // cruiseSpeed: 187,
    // runwayTakeoff: null,
    // runwayLanding: null,
    hasNoRadioNav: true,
  },
  q400: {
    name: "De Havilland DHC-8",
    type: null,
    icaoCode: "DH8D",
    aeroflyCode: "q400",
    // callsign: null,
    // cruiseSpeed: 360,
    // runwayTakeoff: null,
    // runwayLanding: null,
  },
  swift: {
    name: "Aériane Swift",
    type: "G",
    icaoCode: "IR99",
    aeroflyCode: "swift",
    //callsign: "D8139",
    //cruiseSpeed: null,
    //runwayTakeoff: null,
    //runwayLanding: null,
  },
};

export const AeroflyAircraftFinder = {
  /**
   *
   * @param {string} aeroflyAircraftCode
   * @param {boolean} useFallback if this is set to `true`, an unknown aircraft code will still return some aircraft data
   * @returns {AeroflyAircraft}
   */
  get: (aeroflyAircraftCode, useFallback = true) => {
    if (AeroflyAircrafts[aeroflyAircraftCode]) {
      return AeroflyAircrafts[aeroflyAircraftCode];
    }

    if (!useFallback) {
      throw Error("Unknown aircraft: " + aeroflyAircraftCode);
    }

    const icaoCode = aeroflyAircraftCode.toUpperCase();
    const callsign =
      "N" +
      String.fromCharCode(
        (icaoCode.charCodeAt(1) % 9) + 49, // Numeric 1..9
        AeroflyAircraftFinder.randomizedLetter(icaoCode.charCodeAt(0)),
        AeroflyAircraftFinder.randomizedLetter(icaoCode.charCodeAt(3) ?? 0),
        AeroflyAircraftFinder.randomizedLetter(icaoCode.charCodeAt(2) ?? 0),
      );

    /**
     * @type {AeroflyAircraftBasic?}
     */
    const fallback = AeroflyAircraftsBasic[aeroflyAircraftCode] ?? null;

    return {
      name: fallback?.name ?? icaoCode,
      type: fallback?.type ?? null,
      icaoCode: fallback?.icaoCode ?? icaoCode,
      aeroflyCode: aeroflyAircraftCode,
      callsign: callsign,
      cruiseSpeed: 120,
      runwayTakeoff: 8000,
      runwayLanding: 6000,
      hasNoRadioNav: fallback?.hasNoRadioNav ?? false,
    };
  },

  /**
   * Letterchar code, without I and O
   * @param {number} seed
   * @returns {number}
   */
  randomizedLetter(seed) {
    let code = (seed % 26) + 65;

    // Skip I and O
    if (code === 73 || code === 79) {
      code += 1;
    }
    return code;
  },
};
