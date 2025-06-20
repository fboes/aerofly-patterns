import { Point } from "@fboes/geojson";
export class HoldingPatternFix {
    constructor(id, name, type, position, mag_dec = 0, 
    /**
     * in Hz, null if not applicable
     */
    frequency = null) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.position = position;
        this.mag_dec = mag_dec;
        this.frequency = frequency;
    }
    get fullName() {
        const frq = this.frequency !== null
            ? this.type === "NDB"
                ? `${this.frequency / 1000} kHz`
                : `${this.frequency / 1000000} MHz`
            : "";
        if (frq) {
            return `${this.name} (${this.id}, ${frq})`;
        }
        return this.name;
    }
    static fromNavaid(navaid) {
        const name = navaid.name.toLowerCase().replace(/(^|\s)[a-z]/g, (char) => {
            return char.toUpperCase();
        });
        return new HoldingPatternFix(navaid.id, name + " " + navaid.type, navaid.type, new Point(navaid.lon, navaid.lat, navaid.elev), navaid.mag_dec, navaid.freq * (navaid.type === "NDB" ? 1000 : 1000000));
    }
    static fromFix(fix) {
        return new HoldingPatternFix(fix.id, fix.id + " FIX", "FIX", new Point(fix.lon, fix.lat, 0));
    }
}
