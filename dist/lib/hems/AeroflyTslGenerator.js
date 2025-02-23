export class AeroflyTslGenerator {
    /**
     *
     * @param {GeoJsonLocation[]} locations
     * @param {string} environmentId
     */
    constructor(locations, environmentId) {
        this.locations = locations;
        this.environmentId = environmentId;
    }
    get sceneryObjectList() {
        return this.locations.map((location) => {
            return `\
            <[tmsimulator_scenery_object][element][0]
                <[vector3_float64][position][${location.coordinates.longitude} ${location.coordinates.latitude} -10]>
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
        <[string8u][cultivation][${this.environmentId}_emergency_sites]> # TOC file
        <[list_tmsimulator_scenery_object][objects][]
${this.sceneryObjectList.join("\n")}
        >
    >
>
`;
    }
}
