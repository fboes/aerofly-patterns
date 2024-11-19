// @ts-check

/**
 * @callback MissionTypeDescription
 * @param {import("../../lib/hems/GeoJsonLocations").GeoJsonFeature} from
 * @param {import("../../lib/hems/GeoJsonLocations").GeoJsonFeature} to
 * @returns {string}
 */

/**
 * @typedef MissionType
 * @type {object}
 * @property {MissionTypeDescription} title
 * @property {MissionTypeDescription} description
 * @property {{
 * height?: number,
 * color: [number, number, number],
 * flashing: number[],
 * intensity?: number
 * }[]} lights in order of xrefs
 * @property {string[]} xrefs xref model name
 */

/**
 * @type {{[key:string]: MissionType}}}
 */
export const MissionTypes = {
  patientTransfer: {
    title: (from, to) => {
      return `Transfer from ${from.properties.title} to ${to.properties.title}`;
    },
    description: (from, to) => {
      return `You will need to transfer a patient from ${from.properties.title} to ${to.properties.title}.`;
    },
    lights: [],
    xrefs: [],
  },
  medEvac: {
    // eslint-disable-next-line no-unused-vars
    title: (from, to) => {
      return `MedEvac at ${from.properties.title}`;
    },
    description: (from, to) => {
      return `Fly to the specified location to drop off your emergency doctor / paramedic and take a patient on board if necessary. Afterwards fly to ${to.properties.title}.`;
    },
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
    // eslint-disable-next-line no-unused-vars
    title: (from, to) => {
      return `Locate patient at ${from.properties.title}`;
    },
    description: (from, to) => {
      return `Fly to the specified location and locate the patient. You will need to drop off your emergency doctor / paramedic and take the patient on board. Afterwards fly to ${to.properties.title}.`;
    },
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
  shipSar: {
    // eslint-disable-next-line no-unused-vars
    title: (from, to) => {
      return `Ship rescue at ${from.properties.title}`;
    },
    description: (from, to) => {
      return `Fly to the specified ship's position to drop off your emergency doctor / paramedic and take a patient on board. Afterwards fly to ${to.properties.title}.`;
    },
    lights: [
      {
        height: 20,
        color: [1, 1, 1],
        flashing: [20, 0, 100, 0],
      },
    ],
    xrefs: ["police_car"],
  },
  carAccident: {
    // eslint-disable-next-line no-unused-vars
    title: (from, to) => {
      return `Car accident on ${from.properties.title}`;
    },
    description: (from, to) => {
      return `Fly to the specified car accident site to drop off your emergency doctor / paramedic and take a patient on board. Afterwards fly to ${to.properties.title}.`;
    },
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
        return MissionTypes.carAccident;
      case `ship`:
      case `ferry`:
        return MissionTypes.shipSar;
      case `person`:
      case `cricket`:
        return MissionTypes.lostPerson;
      default:
        return MissionTypes.medEvac;
    }
  },
};
