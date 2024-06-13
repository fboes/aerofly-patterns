// @ts-check

const feetPerMeter = 3.28084;
const meterPerStatuteMile = 1609.344;

/**
 * @typedef {object} AeroflyMissionPosition represents origin or destination conditions for flight
 * @property {string} icao uppercase ICAO airport ID
 * @property {number} longitude WGS84
 * @property {number} latitude WGS84
 * @property {number} dir in degree
 * @property {number} alt in meters MSL
 */

/**
 * @typedef {"landing"|"takeoff"|"approach"|"taxi"|"cruise"} AeroflyMissionSetting state of aircraft systems
 */

/**
 * @typedef {"origin"|"departure_runway"|"departure"|"waypoint"|"arrival"|"approach"|"destination_runway"|"destination"} AeroflyMissionCheckpointType
 */

export class AeroflyMissionsList {
  /**
   *
   * @param {AeroflyMission[]} missions
   */
  constructor(missions = []) {
    /**
     * @type {AeroflyMission[]}
     */
    this.missions = missions;
  }

  /**
   *
   * @returns {string}
   */
  toString() {
    const separator = "\n// -----------------------------------------------------------------------------\n";
    return `<[file][][]
    <[tmmissions_list][][]
        <[list_tmmission_definition][missions][]
${separator + this.missions.join(separator) + separator}        >
    >
>`;
  }
}

export class AeroflyMission {
  /**
   *
   * @param {string} title
   * @param {AeroflyMissionCheckpoint[]} checkpoints
   */
  constructor(title, checkpoints = []) {
    /**
     * @type {string}
     */
    this.title = title;

    /**
     * @type {string}
     */
    this.description = "";

    /**
     * @type {AeroflyMissionSetting}
     */
    this.flight_setting = "taxi";

    /**
     * @type {object} lowercase Aerofly aircraft ID
     * @property {string} name
     * @property {string} livery
     * @property {string} icao
     */
    this.aircraft = {
      name: "c172",
      livery: "",
      icao: "",
    };

    /**
     * @type {string} uppercase
     */
    this.callsign = "";

    /**
     * @type {AeroflyMissionPosition}
     */
    this.origin = {
      icao: "",
      longitude: 0,
      latitude: 0,
      dir: 0,
      alt: 0,
    };

    /**
     * @type {AeroflyMissionPosition}
     */
    this.destination = {
      icao: "",
      longitude: 0,
      latitude: 0,
      dir: 0,
      alt: 0,
    };

    /**
     * @type {AeroflyMissionConditions}
     */
    this.conditions = new AeroflyMissionConditions();

    /**
     * @type {AeroflyMissionCheckpoint[]}
     */
    this.checkpoints = checkpoints;
  }

  /**
   * @returns {string}
   */
  getCheckpointsString() {
    return this.checkpoints
      .map((c, index) => {
        c._index = index;
        return c;
      })
      .join("\n");
  }

  /**
   * @throws {Error} on missing waypoints
   * @returns {string}
   */
  toString() {
    if (this.checkpoints.length < 2) {
      throw Error("this.checkpoints.length < 2");
    }
    return `            <[tmmission_definition][mission][]
                <[string8][title][${this.title}]>
                <[string8][description][${this.description}]>
                <[string8]   [flight_setting]     [${this.flight_setting}]>
                <[string8u]  [aircraft_name]      [${this.aircraft.name}]>
                //<[string8u][aircraft_livery]    [${this.aircraft.livery}]>
                <[stringt8c] [aircraft_icao]      [${this.aircraft.icao}]>
                <[stringt8c] [callsign]           [${this.callsign}]>
                <[stringt8c] [origin_icao]        [${this.origin.icao}]>
                <[tmvector2d][origin_lon_lat]     [${this.origin.longitude} ${this.origin.latitude}]>
                <[float64]   [origin_dir]         [${this.origin.dir}]>
                <[float64]   [origin_alt]         [${this.origin.alt}]> // ${this.origin.alt * feetPerMeter} ft MSL
                <[stringt8c] [destination_icao]   [${this.destination.icao}]>
                <[tmvector2d][destination_lon_lat][${this.destination.longitude} ${this.destination.latitude}]>
                <[float64]   [destination_dir]    [${this.destination.dir}]>
${this.conditions}
                <[list_tmmission_checkpoint][checkpoints][]
${this.getCheckpointsString()}
                >
            >`;
  }
}

export class AeroflyMissionConditions {
  constructor() {
    /**
     * @type {Date}
     */
    this.time = new Date();

    /**
     * @type {object}
     * @property {number} direction in degree
     * @property {number} speed in kts
     * @property {number} gusts in kts
     */
    this.wind = {
      direction: 0,
      speed: 0,
      gusts: 0,
    };

    /**
     * @type {number} 0..1, percentage
     */
    this.turbulence_strength = 0;

    /**
     * @type {number} 0..1, percentage
     */
    this.thermal_strength = 0;

    /**
     * @type {number} in meters
     */
    this.visibility = 25_000;

    /**
     * @type {AeroflyMissionConditionsCloud[]}
     */
    this.clouds = [];
  }

  /**
   * @returns {number} the Aerofly value for UTC hours + minutes/60 + seconds/3600
   */
  get time_hours() {
    return this.time.getUTCHours() + this.time.getUTCMinutes() / 60 + this.time.getUTCSeconds() / 3600;
  }

  /**
   * @param {number} visibility_sm `this.visibility` in statute miles instead of meters
   */
  set visibility_sm(visibility_sm) {
    this.visibility = visibility_sm * meterPerStatuteMile;
  }

  /**
   * @returns {string}
   */
  getCloudsString() {
    return this.clouds
      .map((c, index) => {
        c._index = index;
        return c;
      })
      .join("\n");
  }

  /**
   * @returns {string}
   */
  toString() {
    if (this.clouds.length < 1) {
      this.clouds = [new AeroflyMissionConditionsCloud(0, 0)];
    }

    return `                <[tmmission_conditions][conditions][]
                    <[tm_time_utc][time][]
                        <[int32][time_year][${this.time.getUTCFullYear()}]>
                        <[int32][time_month][${this.time.getUTCMonth() + 1}]>
                        <[int32][time_day][${this.time.getUTCDate()}]>
                        <[float64][time_hours][${this.time_hours}]> // ${String(this.time.getUTCHours()).padStart(2, "0") + ":" + String(this.time.getUTCMinutes()).padStart(2, "0")} UTC
                    >
                    <[float64][wind_direction][${this.wind.direction}]>
                    <[float64][wind_speed][${this.wind.speed}]> // kts
                    <[float64][wind_gusts][${this.wind.gusts}]> // kts
                    <[float64][turbulence_strength][${this.turbulence_strength}]>
                    <[float64][thermal_strength][${this.thermal_strength}]>
                    <[float64][visibility][${this.visibility}]> // ${this.visibility / meterPerStatuteMile} SM
${this.getCloudsString()}
                >`;
  }
}

export class AeroflyMissionConditionsCloud {
  /**
   *
   * @param {number} cover 0..1, percentage
   * @param {number} base_feet in meters
   */
  constructor(cover, base_feet) {
    /**
     * @type {number}
     */
    this._index = 0;

    /**
     * @type {number} 0..1, percentage
     */
    this.cover = cover;

    /**
     * @type {number} in meters
     */
    this.base = base_feet / feetPerMeter;
  }

  /**
   * @param {number} base_feet `this.base` in feet instead of meters
   */
  set base_feet(base_feet) {
    this.base = base_feet / feetPerMeter;
  }

  /**
   * @returns {"CLR"|"FEW"|"SCT"|"BKN"|"OVC"} as text representation of `this.cover`
   */
  get cover_code() {
    if (this.cover < 1 / 8) {
      return "CLR";
    } else if (this.cover <= 2 / 8) {
      return "FEW";
    } else if (this.cover <= 4 / 8) {
      return "SCT";
    } else if (this.cover <= 7 / 8) {
      return "BKN";
    }
    return "OVC";
  }

  /**
   * @returns {string}
   */
  toString() {
    const index = this._index === 0 ? "" : String(this._index);
    const comment = this._index === 0 ? "" : "//";

    return `                    ${comment}<[float64][cloud_cover${index}][${this.cover ?? 0}]> // ${this.cover_code}
                    ${comment}<[float64][cloud_base${index}][${this.base}]> // ${this.base * feetPerMeter} ft AGL`;
  }
}

export class AeroflyMissionCheckpoint {
  /**
   * @param {string} name
   * @param {AeroflyMissionCheckpointType} type
   * @param {number} longitude
   * @param {number} latitude
   * @param {number} altitude in meters MSL
   */
  constructor(name, type, longitude, latitude, altitude = 0) {
    /**
     * @type {number}
     */
    this._index = 0;

    /**
     * @type {AeroflyMissionCheckpointType}
     */
    this.type = type;

    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {number}
     */
    this.longitude = longitude;

    /**
     * @type {number}
     */
    this.latitude = latitude;

    /**
     * @type {number} in meters MSL
     */
    this.altitude = altitude;

    /**
     * @type {number?} in degree
     */
    this.direction = null;

    /**
     * @type {number?}
     */
    this.slope = null;

    /**
     * @type {number?} in meters
     */
    this.length = null;

    /**
     * @type {number?} in Hz
     */
    this.frequency = null;
  }

  /**
   * @param {number} altitude_feet
   */
  set altitude_feet(altitude_feet) {
    this.altitude = altitude_feet / feetPerMeter;
  }

  /**
   * @returns {string}
   */
  toString() {
    return `                    <[tmmission_checkpoint][element][${this._index}]
                        <[string8u][type][${this.type}]>
                        <[string8u][name][${this.name}]>
                        <[vector2_float64][lon_lat][${this.longitude} ${this.latitude}]>
                        <[float64][altitude][${this.altitude}]> // ${this.altitude * feetPerMeter} ft
                        <[float64][direction][${this.direction ?? -1}]>
                        <[float64][slope][${this.slope ?? -1}]>
                        <[float64][length][${this.length ?? 0}]>
                        <[float64][frequency][${this.frequency ?? 0}]>
                    >`;
  }
}

export default {
  AeroflyMissionsList,
  AeroflyMission,
  AeroflyMissionConditions,
  AeroflyMissionConditionsCloud,
  AeroflyMissionCheckpoint,
};
