export class LocalTime {
    hours;
    minutes;
    date;
    month;
    fullYear;
    _offsetDate;
    _offsetHours;
    constructor(date, offsetHours) {
        this._offsetHours = Math.round(offsetHours);
        this._offsetDate = new Date(date);
        this._offsetDate.setUTCHours(this._offsetDate.getUTCHours() + Math.round(offsetHours));
        this.hours = this._offsetDate.getUTCHours();
        this.minutes = this._offsetDate.getUTCMinutes();
        this.date = this._offsetDate.getUTCDate();
        this.month = this._offsetDate.getUTCMonth();
        this.fullYear = this._offsetDate.getUTCFullYear();
    }
    toDateString() {
        return (this.fullYear + "-" + (this.month + 1).toFixed().padStart(2, "0") + "-" + this.date.toFixed().padStart(2, "0"));
    }
    toTimeString() {
        return this.hours.toFixed().padStart(2, "0") + ":" + this.minutes.toFixed().padStart(2, "0");
    }
    get nauticalZoneId() {
        if (this._offsetHours === 0) {
            return "Z";
        }
        else if (this._offsetHours > 0) {
            return String.fromCharCode(this._offsetHours + 77);
        }
        else if (this._offsetHours < -9) {
            return String.fromCharCode(Math.abs(this._offsetHours) + 65);
        }
        else if (this._offsetHours < 0) {
            return String.fromCharCode(Math.abs(this._offsetHours) + 64); // Exclude "J"
        }
        return "";
    }
    get timeZone() {
        const prefix = this._offsetHours < 0 ? "-" : "+";
        return `${prefix}${Math.abs(this._offsetHours).toFixed().padStart(2, "0")}:00`;
    }
}
