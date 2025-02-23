export const Degree = (degree) => {
    return (degree + 360) % 360;
};
export const degreeToRad = (degree) => {
    return (degree / 180) * Math.PI;
};
/**
 * Computes the difference between to angles
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
