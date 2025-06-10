/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 */
export class Rand {
    /**
     * This example returns a random integer between the specified values.
     * The value is no lower than min (or the next integer greater than min
     * if min isn't an integer), and is less than (but not equal to) max.
     */
    static getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        if (minCeiled === maxFloored) {
            return minCeiled;
        }
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }
    /**
     * This example returns a random number between the specified values.
     * The returned value is no lower than (and may possibly equal) min,
     * and is less than (and not equal) max.
     */
    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
}
