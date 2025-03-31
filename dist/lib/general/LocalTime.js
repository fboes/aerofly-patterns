var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LocalTime_offsetDate, _LocalTime_offsetHours;
export class LocalTime {
    constructor(date, offsetHours) {
        _LocalTime_offsetDate.set(this, void 0);
        _LocalTime_offsetHours.set(this, void 0);
        __classPrivateFieldSet(this, _LocalTime_offsetHours, Math.round(offsetHours), "f");
        __classPrivateFieldSet(this, _LocalTime_offsetDate, new Date(date), "f");
        __classPrivateFieldGet(this, _LocalTime_offsetDate, "f").setUTCHours(__classPrivateFieldGet(this, _LocalTime_offsetDate, "f").getUTCHours() + Math.round(offsetHours));
        this.hours = __classPrivateFieldGet(this, _LocalTime_offsetDate, "f").getUTCHours();
        this.minutes = __classPrivateFieldGet(this, _LocalTime_offsetDate, "f").getUTCMinutes();
        this.date = __classPrivateFieldGet(this, _LocalTime_offsetDate, "f").getUTCDate();
        this.month = __classPrivateFieldGet(this, _LocalTime_offsetDate, "f").getUTCMonth();
        this.fullYear = __classPrivateFieldGet(this, _LocalTime_offsetDate, "f").getUTCFullYear();
    }
    toDateString() {
        return (this.fullYear + "-" + (this.month + 1).toFixed().padStart(2, "0") + "-" + this.date.toFixed().padStart(2, "0"));
    }
    toTimeString() {
        return this.hours.toFixed().padStart(2, "0") + ":" + this.minutes.toFixed().padStart(2, "0");
    }
    get nauticalZoneId() {
        if (__classPrivateFieldGet(this, _LocalTime_offsetHours, "f") === 0) {
            return "Z";
        }
        else if (__classPrivateFieldGet(this, _LocalTime_offsetHours, "f") > 0) {
            return String.fromCharCode(__classPrivateFieldGet(this, _LocalTime_offsetHours, "f") + 77);
        }
        else if (__classPrivateFieldGet(this, _LocalTime_offsetHours, "f") < -9) {
            return String.fromCharCode(Math.abs(__classPrivateFieldGet(this, _LocalTime_offsetHours, "f")) + 65);
        }
        else if (__classPrivateFieldGet(this, _LocalTime_offsetHours, "f") < 0) {
            return String.fromCharCode(Math.abs(__classPrivateFieldGet(this, _LocalTime_offsetHours, "f")) + 64); // Exclude "J"
        }
        return "";
    }
    get timeZone() {
        const prefix = __classPrivateFieldGet(this, _LocalTime_offsetHours, "f") < 0 ? "-" : "+";
        return `${prefix}${Math.abs(__classPrivateFieldGet(this, _LocalTime_offsetHours, "f")).toFixed().padStart(2, "0")}:00`;
    }
}
_LocalTime_offsetDate = new WeakMap(), _LocalTime_offsetHours = new WeakMap();
