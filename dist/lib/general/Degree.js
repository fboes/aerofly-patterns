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
 * @returns {number}
 */
export const degreeDifference = (fromDegree, toDegree) => {
  let result = toDegree - fromDegree;
  while (result > 180) {
    result -= 360;
  }
  while (result < -180) {
    result += 360;
  }

  return result;
};
