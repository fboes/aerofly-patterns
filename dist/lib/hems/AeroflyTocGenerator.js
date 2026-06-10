import { MissionTypeFinder } from "../../data/hems/MissionTypes.js";
export class AeroflyTocGenerator {
    locations;
    constructor(locations) {
        this.locations = locations;
    }
    get objectList() {
        const lightList = [];
        const xrefList = [];
        this.locations.forEach((location) => {
            return MissionTypeFinder.get(location).objects.map((object, index) => {
                const coordinates = this._getLonLat(location, index);
                xrefList.push(`\
            <[xref][element][0]
                <[vector3_float64][position][${coordinates.longitude} ${coordinates.latitude} 0]>
                <[float64][direction][${location.direction}]>
                <[string8u][name][${object.xref}]>
            >`);
                if (object.light) {
                    lightList.push(`\
            <[light][element][0]
                <[vector3_float64][position][${coordinates.longitude} ${coordinates.latitude} ${object.light.height ?? 1}]>
                <[vector3_float32][color][${object.light.color.join(" ")}]>
                <[float32][intensity][${object.light.intensity ?? 100}]>
                <[vector4_float32][flashing][${object.light.flashing.join(" ")}]>
                <[uint32][group_index][1]>
            >`);
                }
            });
        });
        return {
            xrefList,
            lightList,
        };
    }
    _getLonLat(location, index) {
        return {
            longitude: location.coordinates.longitude + 0.00035 * index,
            latitude: location.coordinates.latitude + 0.000064 * index,
        };
    }
    toString() {
        const objectList = this.objectList;
        return `\
<[file][][]
    <[cultivation][][]
        <[string8][coordinate_system][lonlat]>
        <[list_light][light_list][]
${objectList.lightList.join("\n")}
        >
        <[list_xref][xref_list][]
${objectList.xrefList.join("\n")}
        >
    >
>`;
    }
}
