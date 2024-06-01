// @ts-check

export class DateYielder {
  /**
   *
   * @param {number} count
   * @param {number} [offsetHours]
   * @param {Date} [startDate]
   * @param {number} [hoursSpacing]  between missions
   */
  constructor(count, offsetHours = 0, startDate = new Date(), hoursSpacing = 1.5) {
    /**
     * @type {number}
     */
    this.count = count;

    /**
     * @type {number}
     */
    this.offsetHours = offsetHours;

    /**
     * @type {number} hours spacing between missions
     */
    this.hoursSpacing = hoursSpacing;

    /**
     * @type {Date}
     */
    this.startDate = this.getLocalTime(startDate, 12 - ((count - 1) * this.hoursSpacing) / 2);
  }

  /**
   *
   * @param {number} index
   * @yields {Date}
   * @generator
   */
  *entries(index = 0) {
    while (index < this.count) {
      const currenDate = new Date(this.startDate);
      currenDate.setDate(currenDate.getDate() - index);
      currenDate.setUTCMinutes(currenDate.getUTCMinutes() + index * this.hoursSpacing * 60);

      yield currenDate;

      index++;
    }
  }

  /**
   * Gets the next local 8 o'clock in the past
   * @param {Date} startDate
   * @param {number} hours local time
   * @returns {Date}
   */
  getLocalTime(startDate, hours = 6) {
    const eightOClock = new Date(startDate);
    eightOClock.setUTCMinutes(60 * (hours % 1));
    eightOClock.setUTCHours(Math.floor(hours - this.offsetHours));

    while (eightOClock.valueOf() > startDate.valueOf()) {
      eightOClock.setDate(eightOClock.getDate() - 1);
    }

    return eightOClock;
  }
}
