// @ts-check

/**
 *
 * @param {Date} date
 * @param {number} offsetHours
 * @returns {{hours:number, minutes:number, date: number, month: number, fullYear: number}}
 */
export const LocalSolarTime = (date, offsetHours) => {
  const offsetDate = new Date(date);
  offsetDate.setUTCHours(offsetDate.getUTCHours() + Math.round(offsetHours));
  return {
    hours: offsetDate.getUTCHours(),
    minutes: offsetDate.getUTCMinutes(),
    date: offsetDate.getUTCDate(),
    month: offsetDate.getUTCMonth(),
    fullYear: offsetDate.getUTCFullYear(),
  };
};
