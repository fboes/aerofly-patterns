// @ts-check

export class AeroflyTocGenerator {
  /**
   *
   * @param {import("./GeoJsonLocations").GeoJsonFeature[]} locations
   */
  constructor(locations) {
    this.locations = locations;
  }

  /**
   * @returns {string[]}
   */
  get lightList() {
    return this.locations.map((location) => {
      const coordinates = this.#getLonLat(location);
      return `\
            <[light][element][0]
                <[vector3_float64][position][${coordinates.ambulance.longitude} ${coordinates.ambulance.latitude} 3]>
                <[vector3_float32][color][0 0 1]>
                <[float32][intensity][100]>
                <[vector4_float32][flashing][10 0 100 0]>
                <[uint32][group_index][1]>
            >
            <[light][element][0]
                <[vector3_float64][position][${coordinates.police_car.longitude} ${coordinates.police_car.latitude} 1.7]>
                <[vector3_float32][color][0 0 1]>
                <[float32][intensity][100]>
                <[vector4_float32][flashing][20 0 100 0]>
                <[uint32][group_index][1]>
            >`;
    });
  }

  /**
   * @returns {string[]}
   */
  get xrefList() {
    return this.locations.map((location) => {
      const coordinates = this.#getLonLat(location);
      return `\
            <[xref][element][0]
                <[vector3_float64][position][${coordinates.ambulance.longitude} ${coordinates.ambulance.latitude} 0]>
                <[float64][direction][000]>
                <[string8u][name][ambulance]>
            >
            <[xref][element][0]
                <[vector3_float64][position][${coordinates.police_car.longitude} ${coordinates.police_car.latitude} 0]>
                <[float64][direction][000]>
                <[string8u][name][police_car]>
            >`;
    });
  }

  /**
   *
   * @param {import("./GeoJsonLocations").GeoJsonFeature} location
   * @returns {{
   *   ambulance: {
   *     longitude: number,
   *     latitude: number,
   *   },
   *   police_car: {
   *     longitude: number,
   *     latitude: number,
   *   }
   * }}
   */
  #getLonLat(location) {
    return {
      ambulance: {
        longitude: location.geometry.coordinates[0],
        latitude: location.geometry.coordinates[1],
      },
      police_car: {
        longitude: location.geometry.coordinates[0] + 0.00035,
        latitude: location.geometry.coordinates[1] + 0.000064,
      },
    };
  }

  toString() {
    return `\
<[file][][]
    <[cultivation][][]
        <[string8][coordinate_system][lonlat]>
        <[list_light][light_list][]
${this.lightList.join("\n")}
        >
        <[list_xref][xref_list][]
${this.xrefList.join("\n")}
        >
    >
>`;
  }
}
