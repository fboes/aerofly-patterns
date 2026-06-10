export class LocalTime {
  hours: number;
  minutes: number;
  date: number;
  month: number;
  fullYear: number;

  private _offsetDate: Date;
  private _offsetHours: number;

  constructor(date: Date, offsetHours: number) {
    this._offsetHours = Math.round(offsetHours);
    this._offsetDate = new Date(date);
    this._offsetDate.setUTCHours(this._offsetDate.getUTCHours() + Math.round(offsetHours));

    this.hours = this._offsetDate.getUTCHours();
    this.minutes = this._offsetDate.getUTCMinutes();
    this.date = this._offsetDate.getUTCDate();
    this.month = this._offsetDate.getUTCMonth();
    this.fullYear = this._offsetDate.getUTCFullYear();
  }

  toDateString(): string {
    return (
      this.fullYear + "-" + (this.month + 1).toFixed().padStart(2, "0") + "-" + this.date.toFixed().padStart(2, "0")
    );
  }

  toTimeString(): string {
    return this.hours.toFixed().padStart(2, "0") + ":" + this.minutes.toFixed().padStart(2, "0");
  }

  get nauticalZoneId(): string {
    if (this._offsetHours === 0) {
      return "Z";
    } else if (this._offsetHours > 0) {
      return String.fromCharCode(this._offsetHours + 77);
    } else if (this._offsetHours < -9) {
      return String.fromCharCode(Math.abs(this._offsetHours) + 65);
    } else if (this._offsetHours < 0) {
      return String.fromCharCode(Math.abs(this._offsetHours) + 64); // Exclude "J"
    }
    return "";
  }

  get timeZone(): string {
    const prefix = this._offsetHours < 0 ? "-" : "+";
    return `${prefix}${Math.abs(this._offsetHours).toFixed().padStart(2, "0")}:00`;
  }
}
