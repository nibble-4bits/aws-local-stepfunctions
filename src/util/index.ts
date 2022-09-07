/**
 * Determines if a value is a plain object, i.e. one declared using the `{}` notation or constructed with `new Object()`.
 * @param value The value to test if it's a plain object or not.
 * @returns `true` if `value` is a plain object, `false` if not.
 */
export function isPlainObj(value: any): boolean {
  return !!value && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Pauses the execution of the program for a certain number of milliseconds.
 * @param ms Number of milliseconds to sleep.
 */
export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
