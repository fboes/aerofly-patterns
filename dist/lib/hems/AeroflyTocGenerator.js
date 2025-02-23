var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AeroflyTocGenerator_instances, _AeroflyTocGenerator_getLonLat;
import { MissionTypeFinder } from "../../data/hems/MissionTypes.js";
export class AeroflyTocGenerator {
    constructor(locations) {
        _AeroflyTocGenerator_instances.add(this);
        this.locations = locations;
    }
    get objectList() {
        const lightList = [];
        const xrefList = [];
        this.locations.forEach((location) => {
            return MissionTypeFinder.get(location).objects.map((object, index) => {
                const coordinates = __classPrivateFieldGet(this, _AeroflyTocGenerator_instances, "m", _AeroflyTocGenerator_getLonLat).call(this, location, index);
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
_AeroflyTocGenerator_instances = new WeakSet(), _AeroflyTocGenerator_getLonLat = function _AeroflyTocGenerator_getLonLat(location, index) {
    return {
        longitude: location.coordinates.longitude + 0.00035 * index,
        latitude: location.coordinates.latitude + 0.000064 * index,
    };
};
