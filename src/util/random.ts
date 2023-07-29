/**
 * Taken from: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript.
 *
 * More info here: https://github.com/bryc/code/issues/13.
 */
export function cyrb128(str: string) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

/**
 * Taken from: https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 *
 * More info here: https://github.com/bryc/code/blob/master/jshash/PRNGs.md.
 * @returns A random floating point number in the range [0,1).
 */
export function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/**
 * Generates a random integer between two bounds.
 * @param min Lower bound of the range.
 * @param max High bound of the range.
 * @param rng A generator function that produces random values between 0 and 1. If not specified, uses `Math.random` as default.
 * @returns A random integer between `min` and `max` (both inclusive)
 */
export function getRandomNumber(min: number, max: number, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
