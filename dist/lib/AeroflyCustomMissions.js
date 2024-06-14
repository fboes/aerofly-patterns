// @ts-check

const feetPerMeter = 3.28084;
const meterPerStatuteMile = 1609.344;

/**
 * @typedef {object} AeroflyMissionPosition represents origin or destination
 *    conditions for flight
 * @property {string} icao uppercase ICAO airport ID
 * @property {number} longitude easting, using the World Geodetic
 *    System 1984 (WGS 84) [WGS84] datum, with longitude and latitude units
 *    of decimal degrees; -180..180
 * @property {number} latitude northing, using the World Geodetic
 *    System 1984 (WGS 84) [WGS84] datum, with longitude and latitude units
 *    of decimal degrees; -90..90
 * @property {number} dir in degree
 * @property {number} alt the height in meters above or below the WGS
 *    84 reference ellipsoid
 */

/**
 * @typedef {"taxi"|"takeoff"|"cruise"|"approach"|"landing"} AeroflyMissionSetting
 *    State of aircraft systems. Configures power settings, flap positions etc
 */

/**
 * @typedef {"origin"|"departure_runway"|"departure"|"waypoint"|"arrival"|"approach"|"destination_runway"|"destination"} AeroflyMissionCheckpointType
 *    Types of checkpoints. Required are usually "origin", "departure_runway"
 *    at the start and "destination_runway", "destination" at the end.
 */

/**
 * A list of flight plans.
 *
 * The purpose of this class is to collect data needed for Aerofly FS4's
 * `custom_missions_user.tmc` flight plan file format, and export the structure
 * for this file via the `toString()` method.
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
   * @returns {string} to use in Aerofly FS4's `custom_missions_user.tmc`
   */
  toString() {
    const separator = "\n// -----------------------------------------------------------------------------\n";
    return `<[file][][]
    <[tmmissions_list][][]
        <[list_tmmission_definition][missions][]${separator + this.missions.join(separator) + separator}        >
    >
>`;
  }
}

/**
 * A single flighplan, containing aircraft and weather data as well.
 *
 * The purpose of this class is to collect data needed for Aerofly FS4's
 * `custom_missions_user.tmc` flight plan file format, and export the structure
 * for this file via the `toString()` method.
 */
export class AeroflyMission {
  /**
   *
   * @param {string} title of this flight plan
   * @param {AeroflyMissionCheckpoint[]} checkpoints which form the flight plan
   */
  constructor(title, checkpoints = []) {
    /**
     * @type {string} of this flight plan
     */
    this.title = title;

    /**
     * @type {string} additional description text, mission briefing, etc
     */
    this.description = "";

    /**
     * @type {AeroflyMissionSetting} see {AeroflyMissionSetting}
     */
    this.flightSetting = "taxi";

    /**
     * @type {object} data for the aircraft to use on this mission
     * @property {string} name lowercase Aerofly aircraft ID
     * @property {string} livery (not used yet)
     * @property {string} icao ICAO aircraft code
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
     * @type {AeroflyMissionPosition} starting position of aircraft, as well
     *    as name of starting airport. Position does not have match airport.
     */
    this.origin = {
      icao: "",
      longitude: 0,
      latitude: 0,
      dir: 0,
      alt: 0,
    };

    /**
     * @type {AeroflyMissionPosition} intended end position of aircraft, as well
     *    as name of destination airport. Position does not have match airport.
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
     * @type {AeroflyMissionCheckpoint[]} the actual flight plan
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
   * @returns {string} to use in Aerofly FS4's `custom_missions_user.tmc`
   */
  toString() {
    if (this.checkpoints.length < 2) {
      throw Error("this.checkpoints.length < 2");
    }
    return `            <[tmmission_definition][mission][]
                <[string8][title][${this.title}]>
                <[string8][description][${this.description}]>
                <[string8]   [flight_setting]     [${this.flightSetting}]>
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

/**
 * Time and weather data for the given flight plan
 *
 * The purpose of this class is to collect data needed for Aerofly FS4's
 * `custom_missions_user.tmc` flight plan file format, and export the structure
 * for this file via the `toString()` method.
 */
export class AeroflyMissionConditions {
  constructor() {
    /**
     * @type {Date} start time of flight plan. Relevant is the UTC part, so
     *    consider setting this date in UTC.
     */
    this.time = new Date();

    /**
     * @type {object} Weather data for wind
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
    this.turbulenceStrength = 0;

    /**
     * @type {number} 0..1, percentage
     */
    this.thermalStrength = 0;

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
   * @returns {number} the Aerofly value for UTC hours + minutes/60
   *    + seconds/3600. Ignores milliseconds ;)
   */
  get time_hours() {
    return this.time.getUTCHours() + this.time.getUTCMinutes() / 60 + this.time.getUTCSeconds() / 3600;
  }

  /**
   * @returns {string} like "20:15:00"
   */
  get time_presentational() {
    return [this.time.getUTCHours(), this.time.getUTCMinutes(), this.time.getUTCSeconds()]
      .map((t) => {
        return String(t).padStart(2, "0");
      })
      .join(":");
  }

  /**
   * @param {number} visibility_sm `this.visibility` in statute miles instead
   *    of meters
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
   * @returns {string} to use in Aerofly FS4's `custom_missions_user.tmc`
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
                        <[float64][time_hours][${this.time_hours}]> // ${this.time_presentational} UTC
                    >
                    <[float64][wind_direction][${this.wind.direction}]>
                    <[float64][wind_speed][${this.wind.speed}]> // kts
                    <[float64][wind_gusts][${this.wind.gusts}]> // kts
                    <[float64][turbulence_strength][${this.turbulenceStrength}]>
                    <[float64][thermal_strength][${this.thermalStrength}]>
                    <[float64][visibility][${this.visibility}]> // ${this.visibility / meterPerStatuteMile} SM
${this.getCloudsString()}
                >`;
  }
}

/**
 * A cloud layer for the current flight plan's weather data
 *
 * The purpose of this class is to collect data needed for Aerofly FS4's
 * `custom_missions_user.tmc` flight plan file format, and export the structure
 * for this file via the `toString()` method.
 */
export class AeroflyMissionConditionsCloud {
  /**
   * @param {number} cover 0..1, percentage
   * @param {number} base in meters AGL
   */
  constructor(cover, base) {
    /**
     * @type {number}
     */
    this._index = 0;

    /**
     * @type {number} 0..1, percentage
     */
    this.cover = cover;

    /**
     * @type {number} in meters AGL
     */
    this.base = base;
  }

  /**
   * @param {number} cover
   * @param {number} base_feet base, but in feet AGL instead of meters AGL
   * @returns {AeroflyMissionConditionsCloud}
   */
  static createInFeet(cover, base_feet) {
    return new AeroflyMissionConditionsCloud(cover, base_feet / feetPerMeter);
  }

  /**
   * @param {number} base_feet `this.base` in feet instead of meters
   */
  set base_feet(base_feet) {
    this.base = base_feet / feetPerMeter;
  }

  /**
   * @returns {"CLR"|"FEW"|"SCT"|"BKN"|"OVC"} as text representation of
   *    `this.cover`
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
   * @returns {string} to use in Aerofly FS4's `custom_missions_user.tmc`
   */
  toString() {
    const index = this._index === 0 ? "" : String(this._index);
    const comment = this._index === 0 ? "" : "//";

    return `                    ${comment}<[float64][cloud_cover${index}][${this.cover ?? 0}]> // ${this.cover_code}
                    ${comment}<[float64][cloud_base${index}][${this.base}]> // ${this.base * feetPerMeter} ft AGL`;
  }
}

/**
 * A single way point for the given flight plan
 *
 * The purpose of this class is to collect data needed for Aerofly FS4's
 * `custom_missions_user.tmc` flight plan file format, and export the structure
 * for this file via the `toString()` method.
 */
export class AeroflyMissionCheckpoint {
  /**
   * @param {string} name ICAO code for airport, runway designator, navaid
   *    designator, fix name, or custom name
   * @param {AeroflyMissionCheckpointType} type
   *    see {AeroflyMissionCheckpointType}
   * @param {number} longitude easting, using the World Geodetic
   *    System 1984 (WGS 84) [WGS84] datum, with longitude and latitude units
   *    of decimal degrees; -180..180
   * @param {number} latitude northing, using the World Geodetic
   *    System 1984 (WGS 84) [WGS84] datum, with longitude and latitude units
   *    of decimal degrees; -90..90
   * @param {number} altitude  the height in meters above or below the WGS
   *    84 reference ellipsoid
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
     * @type {number} easting, using the World Geodetic
     *    System 1984 (WGS 84) [WGS84] datum, with longitude and latitude units
     *    of decimal degrees; -180..180
     */
    this.longitude = longitude;

    /**
     * @type {number} northing, using the World Geodetic
     *    System 1984 (WGS 84) [WGS84] datum, with longitude and latitude units
     *    of decimal degrees; -90..90
     */
    this.latitude = latitude;

    /**
     * @type {number} the height in meters above or below the WGS
     *    84 reference ellipsoid
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
     * @type {number?} in Hz; multiply by 1000 for kHz, 1_000_000 for MHz
     */
    this.frequency = null;
  }

  /**
   * @param {string} name
   * @param {AeroflyMissionCheckpointType} type
   * @param {number} longitude
   * @param {number} latitude
   * @param {number} altitude_feet altitude, but in feet MSL instead of
   *    meters MSL
   * @returns {AeroflyMissionCheckpoint}
   */
  static createInFeet(name, type, longitude, latitude, altitude_feet = 0) {
    return new AeroflyMissionCheckpoint(name, type, longitude, latitude, altitude_feet / feetPerMeter);
  }

  /**
   * @param {number} altitude_feet
   */
  set altitude_feet(altitude_feet) {
    this.altitude = altitude_feet / feetPerMeter;
  }

  /**
   * @returns {string} to use in Aerofly FS4's `custom_missions_user.tmc`
   */
  toString() {
    return `                    <[tmmission_checkpoint][element][${this._index}]
                        <[string8u][type][${this.type}]>
                        <[string8u][name][${this.name}]>
                        <[vector2_float64][lon_lat][${this.longitude} ${this.latitude}]>
                        <[float64][altitude][${this.altitude}]> // ${this.altitude * feetPerMeter} ft
                        <[float64][direction][${this.direction ?? (this._index === 0 ? -1 : 0)}]>
                        <[float64][slope][${this.slope ?? 0}]>
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
