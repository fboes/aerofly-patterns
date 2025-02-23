export class DateYielder {
  count: number;
  offsetHours: number;
  hoursSpacing: number;
  startDate: Date;
  /**
   *
   * @param {number} count
   * @param {number} [offsetHours]
   * @param {Date} [startDate]
   * @param {number} [hoursSpacing]  between missions
   */
  constructor(count: number, offsetHours: number = 0, startDate: Date = new Date(), hoursSpacing: number = 1.5) {
    this.count = count;
    this.offsetHours = offsetHours;

    /**
     * @type {number} hours spacing between missions
     */
    this.hoursSpacing = hoursSpacing;
    this.startDate = this.getLocalTime(startDate, 12 - ((count - 1) * this.hoursSpacing) / 2);
  }

  /**
   *
   * @param {number} index
   * @yields {Date}
   * @generator
   */
  *entries(index: number = 0): Generator<Date> {
    while (index < this.count) {
      const currenDate = new Date(this.startDate);
      currenDate.setDate(currenDate.getDate() - index);
      currenDate.setUTCMinutes(currenDate.getUTCMinutes() + index * this.hoursSpacing * 60);

      yield currenDate;

      index++;
    }
  }

  /**
   * Gets the next local time with `hours:00` in the past
   * @param {Date} startDate
   * @param {number} hours local time
   * @returns {Date}
   */
  getLocalTime(startDate: Date, hours: number = 6): Date {
    const localTime = new Date(startDate);
    localTime.setUTCMinutes(60 * (hours % 1));
    localTime.setUTCHours(Math.floor(hours - this.offsetHours));
    localTime.setUTCSeconds(0);
    localTime.setUTCMilliseconds(0);

    while (localTime.valueOf() > startDate.valueOf()) {
      localTime.setDate(localTime.getDate() - 1);
    }

    return localTime;
  }
}
