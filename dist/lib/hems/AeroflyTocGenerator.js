// @ts-check

import { MissionTypeFinder } from "../../data/hems/MissionTypes.js";

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
      return MissionTypeFinder.get(location)
        .lights.map((light, index) => {
          const coordinates = this.#getLonLat(location, index);
          return `\
            <[light][element][0]
                <[vector3_float64][position][${coordinates.longitude} ${coordinates.latitude} ${light.height ?? 1}]>
                <[vector3_float32][color][${light.color.join(" ")}]>
                <[float32][intensity][${light.intensity ?? 100}]>
                <[vector4_float32][flashing][${light.flashing.join(" ")}]>
                <[uint32][group_index][1]>
            >`;
        })
        .join("\n");
    });
  }

  /**
   * @returns {string[]}
   */
  get xrefList() {
    return this.locations.map((location) => {
      return MissionTypeFinder.get(location)
        .xrefs.map((xref, index) => {
          const coordinates = this.#getLonLat(location, index);
          return `\
            <[xref][element][0]
                <[vector3_float64][position][${coordinates.longitude} ${coordinates.latitude} 0]>
                <[float64][direction][${location.properties?.direction ?? 0}]>
                <[string8u][name][${xref}]>
            >`;
        })
        .join("\n");
    });
  }

  /**
   *
   * @param {import("./GeoJsonLocations").GeoJsonFeature} location
   * @param {number} index
   * @returns {{
   *   longitude: number,
   *   latitude: number,
   * }}
   */
  #getLonLat(location, index) {
    return {
      longitude: location.geometry.coordinates[0] + 0.00035 * index,
      latitude: location.geometry.coordinates[1] + 0.000064 * index,
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
