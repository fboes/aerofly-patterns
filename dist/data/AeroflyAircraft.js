// @ts-check

/**
 * @typedef AeroflyAircraft
 * @type {object}
 * @property {string} name of aircraft
 * @property {"S"|"G"|"H"|"U"|"W"?} type STOL, Glider, Helicopter, Ultralight, Water
 * @property {string} icaoCode
 * @property {string} callsign
 * @property {number} cruiseSpeed in knots
 * @property {number?} runwayTakeoff length in feet
 * @property {number?} runwayLanding length in feet
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
    callsign: "LH321",
    cruiseSpeed: 447,
    runwayTakeoff: 7186,
    runwayLanding: 4725,
  },
  /*a380: {
    name: "Airbus A380",
    type: null,
    icaoCode: "380",
    callsign: null,
    cruiseSpeed: null,
    runwayTakeoff: null,
    runwayLanding: null,
  }
  asg29: {
    name: "Schleicher ASG 29",
    type: "G",
    icaoCode: null,
    callsign: null,
    cruiseSpeed: null,
    runwayTakeoff: null,
    runwayLanding: null,
  },*/
  b58: {
    // https://beechcraft.txtav.com/en/baron-g58
    name: "Beechcraft Baron 58",
    type: null,
    icaoCode: "BE58",
    callsign: "N58EU",
    cruiseSpeed: 202,
    runwayTakeoff: 1373,
    runwayLanding: 1440,
  },
  /*b737: {
    name: "Boeing 737",
    type: null,
    icaoCode: "B735",
    callsign: null,
    cruiseSpeed: 450,
    runwayTakeoff: null,
    runwayLanding: null,
  },
  b737_900: {
    name: "Boeing 737-900",
    type: null,
    icaoCode: null,
    callsign: null,
    cruiseSpeed: 450,
    runwayTakeoff: null,
    runwayLanding: null,
  },
  b777_300er: {
    name: "Boeing 777",
    type: null,
    icaoCode: "B77W",
    callsign: null,
    cruiseSpeed: 450,
    runwayTakeoff: null,
    runwayLanding: null,
  },
  bf109e: {
    name: "Messerschmitt Bf 109",
    type: null,
    icaoCode: "ME09",
    callsign: null,
    cruiseSpeed: 320,
    runwayTakeoff: null,
    runwayLanding: null,
  },*/
  c172: {
    // https://cessna.txtav.com/en/piston/cessna-skyhawk
    name: "Cessna 172",
    type: null,
    icaoCode: "icaoCode",
    callsign: "N51911",
    cruiseSpeed: 124,
    runwayTakeoff: 960,
    runwayLanding: 575,
  },
  c90gtx: {
    name: "Beechcraft King Air C90",
    type: null,
    icaoCode: "BE9L",
    callsign: "DIBYP",
    cruiseSpeed: 217,
    runwayTakeoff: 2557,
    runwayLanding: 3417,
  },
  /*camel: {
    name: "Sopwith Camel",
    type: null,
    icaoCode: "CAML",
    callsign: null,
    cruiseSpeed: 98,
    runwayTakeoff: null,
    runwayLanding: null,
  },*/
  concorde: {
    name: "Aérospatiale-BAC Concorde",
    type: null,
    icaoCode: "CONC",
    callsign: "FBVFB",
    cruiseSpeed: 1165,
    runwayTakeoff: null,
    runwayLanding: null,
  },
  /*dr1: {
    name: "Fokker Dr.I",
    type: null,
    icaoCode: null,
    callsign: null,
    cruiseSpeed: null,
    runwayTakeoff: null,
    runwayLanding: null,
  },*/
  ec135: {
    name: "Eurocopter EC135",
    type: "H",
    icaoCode: "EC35",
    callsign: "CHX64",
    cruiseSpeed: 137,
    runwayTakeoff: 0,
    runwayLanding: 0,
  },
  f15e: {
    name: "McDonnell Douglas F-15E Strike Eagle",
    type: null,
    icaoCode: "F15",
    callsign: "ASJ0494",
    cruiseSpeed: 570,
    runwayTakeoff: 985,
    runwayLanding: 1641,
  },
  f18: {
    name: "McDonnell Douglas F/A-18 Hornet",
    type: null,
    icaoCode: "F18H",
    callsign: "VVAC260",
    cruiseSpeed: 570,
    runwayTakeoff: 1477,
    runwayLanding: 1313,
  },
  /*f4u: {
    name: "Vought F4U Corsair",
    type: null,
    icaoCode: "CORS",
    callsign: null,
    cruiseSpeed: 187,
    runwayTakeoff: null,
    runwayLanding: null,
  },*/
  jungmeister: {
    name: "Bücker Bü 133 Jungmeister",
    type: null,
    icaoCode: "BU33",
    callsign: "HBMIZ",
    cruiseSpeed: 108,
    runwayTakeoff: 380,
    runwayLanding: 374,
  },
  lj45: {
    name: "Learjet 45",
    type: null,
    icaoCode: "LJ45",
    callsign: "DCSDD",
    cruiseSpeed: 450,
    runwayTakeoff: 4348,
    runwayLanding: 2658,
  },
  mb339: {
    name: "Aermacchi MB-339",
    type: null,
    icaoCode: "M339",
    callsign: "FPR456",
    cruiseSpeed: 350,
    runwayTakeoff: 1772,
    runwayLanding: 1542,
  },
  p38: {
    name: "Lockheed P-38",
    type: null,
    icaoCode: "P38",
    callsign: "N38BP",
    cruiseSpeed: 239,
    runwayTakeoff: null,
    runwayLanding: null,
  },
  pitts: {
    name: "Pitts Special S-2",
    type: null,
    icaoCode: "PTS2",
    callsign: "DEUJS",
    cruiseSpeed: 152,
    runwayTakeoff: null,
    runwayLanding: null,
  },
  /*q400: {
    name: "De Havilland DHC-8",
    type: null,
    icaoCode: "DH8D",
    callsign: null,
    cruiseSpeed: 360,
    runwayTakeoff: null,
    runwayLanding: null,
  },*/
  r22: {
    name: "Robinson R22",
    type: "H",
    icaoCode: "R22",
    callsign: "VHPHK",
    cruiseSpeed: 96,
    runwayTakeoff: 0,
    runwayLanding: 0,
  },
  /*swift: {
    name: "Aériane Swift",
    type: "G",
    icaoCode: null,
    callsign: "D8139",
    cruiseSpeed: null,
    runwayTakeoff: null,
    runwayLanding: null,
  },*/
  uh60: {
    name: "Sikorsky UH-60 Black Hawk",
    type: "H",
    icaoCode: "H60",
    callsign: "EVAC26212",
    cruiseSpeed: 152,
    runwayTakeoff: 0,
    runwayLanding: 0,
  },
};
