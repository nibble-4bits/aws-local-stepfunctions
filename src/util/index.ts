import type { JSONObject, JSONValue } from '../typings/JSONValue';

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
  if (ms === 0) return;

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

/**
 * Recursively deep-clones a JSON value, producing a new value with no shared references.
 */
export function cloneJSON(value: JSONValue): JSONValue {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(cloneJSON);
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cloneJSON(v)]));
}

/**
 * Recursively compares two JSON values for deep equality.
 * Comparison is independent of key order for objects.
 */
export function isEqualJSON(a: JSONValue, b: JSONValue): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => isEqualJSON(v, b[i]));
  }
  const aObj = a as JSONObject;
  const bObj = b as JSONObject;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => Object.prototype.hasOwnProperty.call(bObj, k) && isEqualJSON(aObj[k], bObj[k]));
}

/**
 * Sets a value at a path in a JSON object, returning a new object without mutating the original.
 * Handles dot notation (foo.bar), bracket notation (foo['bar'], foo["bar"]), and array indices (foo[0]).
 */
export function setJSONPath(obj: JSONObject, path: string, value: JSONValue): JSONObject {
  function parseSegments(p: string): (string | number)[] {
    const segments: (string | number)[] = [];
    let current = '';
    let i = 0;
    while (i < p.length) {
      const ch = p[i];
      if (ch === '.') {
        if (current.length > 0) {
          segments.push(current);
          current = '';
        }
        i++;
      } else if (ch === '[') {
        if (current.length > 0) {
          segments.push(current);
          current = '';
        }
        i++; // skip '['
        const quote = p[i];
        if (quote === '"' || quote === "'") {
          i++; // skip opening quote
          while (i < p.length && p[i] !== quote) current += p[i++];
          i++; // skip closing quote
          segments.push(current);
        } else {
          while (i < p.length && p[i] !== ']') current += p[i++];
          segments.push(parseInt(current, 10));
        }
        current = '';
        i++; // skip ']'
      } else {
        current += ch;
        i++;
      }
    }
    if (current.length > 0) segments.push(current);
    return segments;
  }

  function setAtSegments(target: JSONValue, segments: (string | number)[]): JSONValue {
    if (segments.length === 0) return value;
    const [head, ...tail] = segments;
    if (typeof head === 'number') {
      const arr: JSONValue[] = Array.isArray(target) ? [...(target as JSONValue[])] : [];
      arr[head] = setAtSegments(arr[head] !== undefined ? arr[head] : null, tail);
      return arr;
    }
    const o: JSONObject =
      typeof target === 'object' && target !== null && !Array.isArray(target) ? { ...(target as JSONObject) } : {};
    const existing = (o as Record<string, JSONValue>)[head];
    o[head] = setAtSegments(existing !== undefined ? existing : null, tail);
    return o;
  }

  return setAtSegments(obj, parseSegments(path)) as JSONObject;
}

export { getRandomNumber, sfc32, cyrb128 } from './random';
