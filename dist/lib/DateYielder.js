// @ts-check

export class DateYielder {
  /**
   *
   * @param {number} count
   * @param {number} offsetHours
   * @param {Date} startDate
   */
  constructor(count, offsetHours = 0, startDate = new Date()) {
    /**
     * @type {number}
     */
    this.count = count;

    /**
     * @type {number}
     */
    this.offsetHours = offsetHours;

    /**
     * @type {Date}
     */
    this.startDate = this.getLocalTime(startDate, 12 - (count - 1) / 2);
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
      currenDate.setUTCHours(currenDate.getUTCHours() + index);

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
