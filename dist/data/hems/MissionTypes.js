// @ts-check

/**
 * @typedef MissionTypeLight
 * @type {{
 * height?: number,
 * color: [number, number, number],
 * flashing: number[],
 * intensity?: number
 * }}
 */

/**
 * @typedef MissionType
 * @type {object}
 * @property {string} title with ${origin} and ${destination} placeholders
 * @property {string} description with ${origin} and ${destination} placeholders
 * @property {MissionTypeLight[]} lights in order of xrefs
 * @property {string[]} xrefs xref model name
 */

/**
 * @type {{[key:string]: MissionType}}}
 */
export const MissionTypes = {
  patientTransfer: {
    title: "Transfer from ${origin} to ${destination}",
    description: "You will need to transfer a patient from ${origin} to ${destination}.",
    lights: [],
    xrefs: [],
  },
  medEvac: {
    title: "MedEvac at ${origin}",
    description:
      "Fly to the specified location to drop off your emergency doctor / paramedic and take a patient on board if necessary. Afterwards fly to ${destination}.",
    lights: [
      {
        height: 3,
        color: [0, 0, 1],
        flashing: [10, 0, 100, 0],
      },
      {
        height: 1.7,
        color: [0, 0, 1],
        flashing: [20, 0, 100, 0],
      },
    ],
    xrefs: ["ambulance", "police_car"],
  },
  lostPerson: {
    title: "Locate person in distress at ${origin}",
    description:
      "Fly to the specified location and locate the person in distress. You will need to drop off your emergency doctor / paramedic and take the person on board. Afterwards fly to ${destination}.",
    lights: [
      {
        height: 1.4,
        color: [1, 1, 1],
        flashing: [20, 0, 100, 0],
        intensity: 10,
      },
    ],
    xrefs: ["staticpeople_man01"],
  },
  ship: {
    title: "Ship rescue at ${origin}",
    description:
      "Fly to the specified ship's position to drop off your emergency doctor / paramedic and take a patient on board. Afterwards fly to ${destination}.",
    lights: [
      {
        height: 20,
        color: [1, 1, 1],
        flashing: [20, 0, 100, 0],
      },
    ],
    xrefs: ["police_car"],
  },
  car: {
    title: "Car accident on ${origin}",
    description:
      "Fly to the specified car accident site to drop off your emergency doctor / paramedic and take a patient on board. Afterwards fly to ${destination}.",
    lights: [
      {
        height: 1.7,
        color: [0, 0, 1],
        flashing: [20, 0, 100, 0],
      },
    ],
    xrefs: ["police_car", "car_01"],
  },
};

export const MissionTypeFinder = {
  /**
   *
   * @param {import("../../lib/hems/GeoJsonLocations").GeoJsonFeature} location
   * @returns {MissionType}
   */
  get(location) {
    switch (location.properties["marker-symbol"]) {
      case `hospital`:
        return MissionTypes.patientTransfer;
      case `car`:
      case `road-accident`:
        return MissionTypes.car;
      case `ship`:
      case `ferry`:
        return MissionTypes.ship;
      case `person`:
      case `cricket`:
      case `mountain`:
      case `swimming`:
        return MissionTypes.lostPerson;
      case `bicycle`:
        return this._quickMission("Bike accident");
      case `bus`:
        return this._quickMission("Bus accident");
      case `farm`:
        return this._quickMission("Farming accident");
      case `logging`:
        return this._quickMission("Logging accident");
      case `rail-light`:
        return this._quickMission("Tram accident");
      case `rail-metro`:
        return this._quickMission("Metro train accident");
      case `rail`:
        return this._quickMission("Train accident");
      case `fire-station`:
      default:
        return MissionTypes.medEvac;
    }
  },

  /**
   * This generates quick fallback `MissionType`, which at least changes title and description.
   * @param {string} accidentType
   * @param {MissionTypeLight[]} lights
   * @param {string[]} xrefs
   * @returns {MissionType}
   */
  _quickMission(
    accidentType,
    lights = [
      {
        height: 3,
        color: [0, 0, 1],
        flashing: [10, 0, 100, 0],
      },
    ],
    xrefs = ["ambulance"],
  ) {
    return {
      title: `${accidentType} at \${origin}`,
      description: `Fly to the specified ${accidentType.toLowerCase()} site to drop off your emergency doctor / paramedic and take a patient on board if necessary. Afterwards fly to \${destination}.`,
      lights,
      xrefs,
    };
  },
};
