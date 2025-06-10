import { Point } from "@fboes/geojson";
import {
  AviationWeatherApiFix,
  AviationWeatherApiNavaid,
  AviationWeatherApiNavaidType,
} from "../general/AviationWeatherApi.js";

export class HoldingPatternFix {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: AviationWeatherApiNavaidType | "FIX",
    public readonly position: Point,
    public readonly mag_dec: number = 0,

    /**
     * in Hz, null if not applicable
     */
    public readonly frequency: number | null = null,
  ) {}

  get fullName(): string {
    const frq =
      this.frequency !== null
        ? this.type === "NDB"
          ? `${this.frequency / 1_000} kHz`
          : `${this.frequency / 1_000_000} MHz`
        : "";

    if (frq) {
      return `${this.name} (${this.id}, ${frq})`;
    }

    return this.name;
  }

  static fromNavaid(navaid: AviationWeatherApiNavaid): HoldingPatternFix {
    const name = navaid.name.toLowerCase().replace(/(^|\s)[a-z]/g, (char) => {
      return char.toUpperCase();
    });
    return new HoldingPatternFix(
      navaid.id,
      name + " " + navaid.type,
      navaid.type,
      new Point(navaid.lon, navaid.lat, navaid.elev),
      navaid.mag_dec,
      navaid.freq * (navaid.type === "NDB" ? 1_000 : 1_000_000),
    );
  }

  static fromFix(fix: AviationWeatherApiFix): HoldingPatternFix {
    return new HoldingPatternFix(fix.id, fix.id + " FIX", "FIX", new Point(fix.lon, fix.lat, 0));
  }
}
