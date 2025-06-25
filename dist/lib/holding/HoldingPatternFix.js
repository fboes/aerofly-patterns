import { Point } from "@fboes/geojson";
export class HoldingPatternFix {
    constructor(id, name, type, position, 
    /**
     * with "+" to the east and "-" to the west. Substracted from a true heading this will give the magnetic heading.
     */
    mag_dec = 0, 
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
                ? `${this.frequency / 1_000} kHz`
                : `${this.frequency / 1_000_000} MHz`
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
        return new HoldingPatternFix(navaid.id, name + " " + navaid.type, navaid.type, new Point(navaid.lon, navaid.lat, navaid.elev), navaid.mag_dec, navaid.freq * (navaid.type === "NDB" ? 1_000 : 1_000_000));
    }
    static fromFix(fix) {
        return new HoldingPatternFix(fix.id, fix.id + " FIX", "FIX", new Point(fix.lon, fix.lat, 0));
    }
    /**
     * Static method to create a HoldingPatternFix from an id.
     * This is used to create a fix for the Jersey holding pattern.
     * @param id VOR, NDB or FIX id
     */
    static fromId(id) {
        switch (id) {
            case "JW":
                return new HoldingPatternFix(id, "Jersey", "NDB", new Point(-2.22, 49.2058333, 84), -0.03, 329 * 1_000);
            case "JSY":
                return new HoldingPatternFix(id, "Jersey", "VORTAC", new Point(-2.0461, 49.2211, 84), -0.09, 112.2 * 1_000_000);
            case "SHARK":
                return new HoldingPatternFix(id, id, "FIX", new Point(-2.429474, 49.189736, 0));
        }
        return null;
    }
}
