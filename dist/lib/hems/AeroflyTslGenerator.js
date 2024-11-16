// @ts-check

export class AeroflyTslGenerator {
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
  get sceneryObjectList() {
    return this.locations.map((location) => {
      return `\
            <[tmsimulator_scenery_object][element][0]
                <[vector3_float64][position][${location.geometry.coordinates[0]} ${location.geometry.coordinates[1]} -10]>
                <[int32][autoheight_override][-1]>
                <[string8][geometry][fallback/fallback]>
                <[string8u][type][object]>
            >`;
    });
  }

  toString() {
    return `\
<[file][][]
    <[tmsimulator_scenery_place_simple][][]
        <[string8u] [coordinate_system] [lonlat]>
        <[bool][autoheight][true]>
        <[string8u][cultivation][emergency_sites]>
        <[list_tmsimulator_scenery_object][objects][]
${this.sceneryObjectList.join("\n")}
        >
    >
>
`;
  }
}
