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
 * @typedef MissionTypeObject
 * @type {{
 * xref: string,
 * light?: MissionTypeLight
 * }}
 */

/**
 * @typedef MissionType
 * @type {object}
 * @property {string} title with ${origin} and ${destination} placeholders
 * @property {string} description with ${origin} and ${destination} placeholders
 * @property {MissionTypeObject[]} objects
 */

/**
 * @type {{[key:string]: MissionType}}}
 */
export const MissionTypes = {
  patientTransfer: {
    title: "Transfer from ${origin} to ${destination}",
    description: "You will need to transfer a patient from ${origin} to ${destination}.",
    objects: [],
  },
  medEvac: {
    title: "MedEvac at ${origin}",
    description:
      "Fly to the specified location to drop off your emergency doctor / paramedic and take a patient on board if necessary. Afterwards fly to ${destination}.",
    objects: [
      {
        xref: "ambulance",
        light: {
          height: 3,
          color: [0, 0, 1],
          flashing: [10, 0, 100, 0],
        },
      },
      {
        xref: "police_car",
        light: {
          height: 1.7,
          color: [0, 0, 1],
          flashing: [20, 0, 100, 0],
        },
      },
    ],
  },
  lostPerson: {
    title: "Locate person in distress at ${origin}",
    description:
      "Fly to the specified location and locate the person in distress. You will need to drop off your emergency doctor / paramedic and take the person on board. Afterwards fly to ${destination}.",
    objects: [
      {
        xref: "staticpeople_man01",
        light: {
          height: 1.4,
          color: [1, 1, 1],
          flashing: [20, 0, 100, 0],
          intensity: 10,
        },
      },
    ],
  },
  ship: {
    title: "Ship rescue at ${origin}",
    description:
      "Fly to the specified ship's position to drop off your emergency doctor / paramedic and take a patient on board. Afterwards fly to ${destination}.",
    objects: [
      {
        xref: "police_car",
        light: {
          height: 1.7,
          color: [0, 0, 1],
          flashing: [20, 0, 100, 0],
        },
      },
    ],
  },
  car: {
    title: "Car accident on ${origin}",
    description:
      "Fly to the specified car accident site to drop off your emergency doctor / paramedic and take a patient on board. Afterwards fly to ${destination}.",
    objects: [
      {
        xref: "police_car",
        light: {
          height: 1.7,
          color: [0, 0, 1],
          flashing: [20, 0, 100, 0],
        },
      },
      {
        xref: "car_01",
      },
    ],
  },
};

export const MissionTypeFinder = {
  /**
   *
   * @param {import("../../lib/hems/GeoJsonLocations").GeoJsonLocation} location
   * @returns {MissionType}
   */
  get(location) {
    switch (location.markerSymbol) {
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
   * @param {MissionTypeObject[]} objects
   * @returns {MissionType}
   */
  _quickMission(
    accidentType,
    objects = [
      {
        xref: "ambulance",
        light: {
          height: 3,
          color: [0, 0, 1],
          flashing: [10, 0, 100, 0],
        },
      },
    ],
  ) {
    return {
      title: `${accidentType} at \${origin}`,
      description: `Fly to the specified ${accidentType.toLowerCase()} site to drop off your emergency doctor / paramedic and take a patient on board if necessary. Afterwards fly to \${destination}.`,
      objects,
    };
  },
};
