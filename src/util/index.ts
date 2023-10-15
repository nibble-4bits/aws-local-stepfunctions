import type { JSONObject } from '../typings/JSONValue';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const isBrowserEnvironment = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Determines if a value is a plain object, i.e. one declared using the `{}` notation or constructed with `new Object()`.
 * @param value The value to test if it's a plain object or not.
 * @returns `true` if `value` is a plain object, `false` if not.
 */
export function isPlainObj(value: unknown): value is JSONObject {
  return !!value && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Pauses the execution of the program for a certain number of milliseconds.
 * Optionally, the pause can be canceled at any moment if an abort signal is passed.
 * @param ms Number of milliseconds to sleep.
 * @param abortSignal An abort signal that can cancel the sleep if the signal is aborted.
 */
export function sleep(ms: number, abortSignal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    // Resolve early if the abort signal has been aborted already
    if (abortSignal?.aborted) {
      return resolve();
    }

    const onAbort = () => {
      clearTimeout(timeout);
      resolve();
    };

    const timeout = setTimeout(() => {
      abortSignal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    abortSignal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Converts a byte (0-255) to its two-digit hexadecimal representation.
 * @param byte A number between 0 and 255.
 * @returns The two-digit hex representation of `byte`.
 */
export function byteToHex(byte: number) {
  return byte.toString(16).padStart(2, '0');
}

/**
 * Attempts to parse a string into a JavaScript object.
 * @param jsonStr The JSON string to be parsed into an object.
 * @returns If the parsing succeeds, return the object. Otherwise return the error.
 */
export function tryJSONParse<T>(jsonStr: string): T | Error {
  try {
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    return error as Error;
  }
}

export function isRFC3339Timestamp(date: string): boolean {
  const regex =
    /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])(\.\d+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/;

  return regex.test(date);
}

export function stringifyJSONValue(value: unknown) {
  return JSON.stringify(value);
}

export function clamp(value: number, min: number | undefined, max: number | undefined) {
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
}

export { getRandomNumber, sfc32, cyrb128 } from './random';
