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
    this.startDate = startDate;
  }

  /**
   *
   * @param {number} index
   * @yields {Date}
   * @generator
   */
  *entries(index = 0) {
    while (index < this.count) {
      const currenDate = new Date(this.startDate.getTime());
      if (this.count > 1) {
        const percentage = index / (this.count - 1);
        currenDate.setDate(currenDate.getDate() - Math.round(percentage * 12) - 1);
        currenDate.setUTCHours(8 + this.offsetHours + percentage * 12);
      }
      yield currenDate;

      index++;
    }
  }
}
