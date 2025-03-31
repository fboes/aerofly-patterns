export class LocalTime {
  hours: number;
  minutes: number;
  date: number;
  month: number;
  fullYear: number;

  #offsetDate: Date;
  #offsetHours: number;

  constructor(date: Date, offsetHours: number) {
    this.#offsetHours = Math.round(offsetHours);
    this.#offsetDate = new Date(date);
    this.#offsetDate.setUTCHours(this.#offsetDate.getUTCHours() + Math.round(offsetHours));

    this.hours = this.#offsetDate.getUTCHours();
    this.minutes = this.#offsetDate.getUTCMinutes();
    this.date = this.#offsetDate.getUTCDate();
    this.month = this.#offsetDate.getUTCMonth();
    this.fullYear = this.#offsetDate.getUTCFullYear();
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
    if (this.#offsetHours === 0) {
      return "Z";
    } else if (this.#offsetHours > 0) {
      return String.fromCharCode(this.#offsetHours + 77);
    } else if (this.#offsetHours < -9) {
      return String.fromCharCode(Math.abs(this.#offsetHours) + 65);
    } else if (this.#offsetHours < 0) {
      return String.fromCharCode(Math.abs(this.#offsetHours) + 64); // Exclude "J"
    }
    return "";
  }

  get timeZone(): string {
    const prefix = this.#offsetHours < 0 ? "-" : "+";
    return `${prefix}${Math.abs(this.#offsetHours).toFixed().padStart(2, "0")}:00`;
  }
}
