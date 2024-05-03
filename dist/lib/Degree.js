// @ts-check

/**
 *
 * @param {number} degree
 * @returns {number} 0..360
 */
export const Degree = (degree) => {
  return (degree + 360) % 360;
};

/**
 *
 * @param {number} degree
 * @returns {number} degree in radians
 */
export const degreeToRad = (degree) => {
  return (degree / 180) * Math.PI;
};

/**
 * COmputes the difference between to angles
 * @param {number} fromDegree
 * @param {number} toDegree
 * @returns {number} -180..180
 */
export const degreeDifference = (fromDegree, toDegree) => {
  return ((toDegree - fromDegree - 180) % 360) + 180;
};
