import { isPlainObj, sleep, isRFC3339Timestamp, cloneJSON, isEqualJSON, setJSONPath } from '../../src/util';
import type { JSONValue } from '../../src/typings/JSONValue';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Utils', () => {
  describe('isPlainObj', () => {
    test('should return `true` if object is plain object', () => {
      const object = { a: 1, b: 'str', c: false, d: [1, 'str', false], e: {} };
      const result = isPlainObj(object);

      expect(result).toBe(true);
    });

    test('should return `false` if object is not plain object', () => {
      const array = [1, 2, 3];
      const number = 123;
      const classObject = new (class MyClass {})();

      const result = isPlainObj(array);
      const result2 = isPlainObj(number);
      const result3 = isPlainObj(classObject);

      expect(result).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });
  });

  describe('sleep', () => {
    test('should resolve promise after the specified number of milliseconds have elapsed', async () => {
      jest.useFakeTimers();

      const sleepPromise = sleep(1000);

      jest.runAllTimers();

      await expect(sleepPromise).resolves.not.toThrow();
    });

    test('should resolve promise when sleep is aborted', async () => {
      const abortController = new AbortController();

      const sleepPromise = sleep(1000, abortController.signal);
      abortController.abort();

      await expect(sleepPromise).resolves.not.toThrow();
    });
  });

  describe('isRFC3339Timestamp', () => {
    const positiveCases = [
      '2023-09-15T18:25:25Z',
      '2023-01-01T00:30:55+06:00',
      '2023-02-05T06:12:18-06:00',
      '2023-03-10T03:09:41+23:59',
      '2023-04-15T23:59:59-23:59',
      '2023-05-20T20:51:48+00:30',
      '2023-06-25T12:07:36-00:30',
      '2023-07-30T19:49:25.1234Z',
      '2023-08-31T15:02:25.46195386+06:00',
      '2023-09-24T01:23:25.5-06:00',
      '2023-10-12T11:15:25.83+23:59',
      '2023-11-16T09:20:25.956-23:59',
      '2023-12-27T16:45:25.19864+00:30',
      '2023-05-19T22:37:25.173064-00:30',
    ];

    describe.each(positiveCases)('Positive tests', (dateStr) => {
      test(`should return true if timestamp ${dateStr} conforms to RFC3339 profile`, () => {
        const result = isRFC3339Timestamp(dateStr);

        expect(result).toBe(true);
      });
    });

    const negativeCases = [
      '2023',
      '2023-09',
      '2023-09-15',
      '2023-09-15T',
      '18:25:25',
      '2023-09-15T18',
      '2023-09-15T18:25',
      '2023-09-1518:25:25',
      '2023-09-15T18:25:25',
      '2023-13-01T00:30:55+06:00',
      '2023-02-78T06:12:18-06:00',
      '2023-03-10T24:09:41+23:59',
      '2023-04-15T23:60:99-23:59',
      '2023-05-20T20:51:48+35:30',
      '2023-06-25T12:07:36-00:65',
      '2023-07-30T19:49:25:1234Z',
      '2023-08-31T15:02:25.46195386Z+06.00',
      '2023-09-24T01:23:25.5-06:00Z',
      '500-10-12T11:15:25.83+23:59',
      '2023-11-16-09:20:25.956-23:59',
      '2023-12-27T16:45:25.19864+00',
      '2023-05-19T22:37:25.173064.00:30',
    ];

    describe.each(negativeCases)('Negative tests', (dateStr) => {
      test(`should return false if timestamp ${dateStr} does not conform to RFC3339 profile`, () => {
        const result = isRFC3339Timestamp(dateStr);

        expect(result).toBe(false);
      });
    });
  });

  describe('cloneJSON', () => {
    describe('primitives', () => {
      test('should return null as-is', () => {
        expect(cloneJSON(null)).toBeNull();
      });

      test('should return boolean true as-is', () => {
        expect(cloneJSON(true)).toBe(true);
      });

      test('should return boolean false as-is', () => {
        expect(cloneJSON(false)).toBe(false);
      });

      test('should return number as-is', () => {
        expect(cloneJSON(42)).toBe(42);
      });

      test('should return negative number as-is', () => {
        expect(cloneJSON(-3.14)).toBe(-3.14);
      });

      test('should return zero as-is', () => {
        expect(cloneJSON(0)).toBe(0);
      });

      test('should return string as-is', () => {
        expect(cloneJSON('hello')).toBe('hello');
      });

      test('should return empty string as-is', () => {
        expect(cloneJSON('')).toBe('');
      });
    });

    describe('objects', () => {
      test('should return a new object reference', () => {
        const obj = { a: 1 };
        expect(cloneJSON(obj)).not.toBe(obj);
      });

      test('should deep-clone an empty object', () => {
        expect(cloneJSON({})).toEqual({});
      });

      test('should deep-clone a flat object', () => {
        expect(cloneJSON({ a: 1, b: 'x', c: true, d: null })).toEqual({ a: 1, b: 'x', c: true, d: null });
      });

      test('should deep-clone a nested object', () => {
        const obj = { a: { b: { c: 42 } } };
        expect(cloneJSON(obj)).toEqual({ a: { b: { c: 42 } } });
      });

      test('should produce a deep clone such that mutating the clone does not affect the original', () => {
        const obj: JSONValue = { a: { b: 1 } };
        const clone = cloneJSON(obj) as { a: { b: number } };
        clone.a.b = 999;
        expect(obj).toEqual({ a: { b: 1 } });
      });

      test('should produce a deep clone such that mutating the original does not affect the clone', () => {
        const obj: { a: { b: number } } = { a: { b: 1 } };
        const clone = cloneJSON(obj);
        obj.a.b = 999;
        expect(clone).toEqual({ a: { b: 1 } });
      });

      test('should deep-clone object with array values', () => {
        const obj = { nums: [1, 2, 3], nested: { flag: true } };
        expect(cloneJSON(obj)).toEqual({ nums: [1, 2, 3], nested: { flag: true } });
      });
    });

    describe('arrays', () => {
      test('should return a new array reference', () => {
        const arr = [1, 2, 3];
        expect(cloneJSON(arr)).not.toBe(arr);
      });

      test('should deep-clone an empty array', () => {
        expect(cloneJSON([])).toEqual([]);
      });

      test('should deep-clone a flat array', () => {
        expect(cloneJSON([1, 'two', true, null])).toEqual([1, 'two', true, null]);
      });

      test('should deep-clone a nested array', () => {
        expect(
          cloneJSON([
            [1, 2],
            [3, [4, 5]],
          ])
        ).toEqual([
          [1, 2],
          [3, [4, 5]],
        ]);
      });

      test('should produce a deep clone such that mutating the clone does not affect the original', () => {
        const arr: JSONValue = [{ a: 1 }, { b: 2 }];
        const clone = cloneJSON(arr) as Array<{ [key: string]: number }>;
        clone[0]['a'] = 999;
        expect(arr).toEqual([{ a: 1 }, { b: 2 }]);
      });

      test('should deep-clone an array of objects', () => {
        expect(cloneJSON([{ a: 1 }, { b: [2, 3] }])).toEqual([{ a: 1 }, { b: [2, 3] }]);
      });
    });
  });

  describe('isEqualJSON', () => {
    describe('null', () => {
      test('should return true for null compared to null', () => {
        expect(isEqualJSON(null, null)).toBe(true);
      });

      test('should return false for null compared to a number', () => {
        expect(isEqualJSON(null, 0)).toBe(false);
      });

      test('should return false for null compared to a boolean', () => {
        expect(isEqualJSON(null, false)).toBe(false);
      });

      test('should return false for null compared to an empty string', () => {
        expect(isEqualJSON(null, '')).toBe(false);
      });

      test('should return false for null compared to an empty object', () => {
        expect(isEqualJSON(null, {})).toBe(false);
      });

      test('should return false for null compared to an empty array', () => {
        expect(isEqualJSON(null, [])).toBe(false);
      });
    });

    describe('booleans', () => {
      test('should return true for true compared to true', () => {
        expect(isEqualJSON(true, true)).toBe(true);
      });

      test('should return true for false compared to false', () => {
        expect(isEqualJSON(false, false)).toBe(true);
      });

      test('should return false for true compared to false', () => {
        expect(isEqualJSON(true, false)).toBe(false);
      });

      test('should return false for false compared to 0', () => {
        expect(isEqualJSON(false, 0)).toBe(false);
      });
    });

    describe('numbers', () => {
      test('should return true for equal numbers', () => {
        expect(isEqualJSON(42, 42)).toBe(true);
      });

      test('should return true for equal negative numbers', () => {
        expect(isEqualJSON(-3.14, -3.14)).toBe(true);
      });

      test('should return true for zero compared to zero', () => {
        expect(isEqualJSON(0, 0)).toBe(true);
      });

      test('should return false for different numbers', () => {
        expect(isEqualJSON(1, 2)).toBe(false);
      });

      test('should return false for number compared to its string representation', () => {
        expect(isEqualJSON(1, '1')).toBe(false);
      });
    });

    describe('strings', () => {
      test('should return true for equal strings', () => {
        expect(isEqualJSON('hello', 'hello')).toBe(true);
      });

      test('should return true for equal empty strings', () => {
        expect(isEqualJSON('', '')).toBe(true);
      });

      test('should return false for different strings', () => {
        expect(isEqualJSON('foo', 'bar')).toBe(false);
      });

      test('should return false for string compared to boolean', () => {
        expect(isEqualJSON('true', true)).toBe(false);
      });
    });

    describe('arrays', () => {
      test('should return true for two empty arrays', () => {
        expect(isEqualJSON([], [])).toBe(true);
      });

      test('should return true for two equal flat arrays', () => {
        expect(isEqualJSON([1, 2, 3], [1, 2, 3])).toBe(true);
      });

      test('should return false for arrays with different lengths', () => {
        expect(isEqualJSON([1, 2], [1, 2, 3])).toBe(false);
      });

      test('should return false for arrays with same elements in different order', () => {
        expect(isEqualJSON([1, 2, 3], [1, 3, 2])).toBe(false);
      });

      test('should return true for equal nested arrays', () => {
        expect(
          isEqualJSON(
            [
              [1, 2],
              [3, 4],
            ],
            [
              [1, 2],
              [3, 4],
            ]
          )
        ).toBe(true);
      });

      test('should return false for arrays where a nested element differs', () => {
        expect(
          isEqualJSON(
            [
              [1, 2],
              [3, 4],
            ],
            [
              [1, 2],
              [3, 5],
            ]
          )
        ).toBe(false);
      });

      test('should return true for arrays containing equal objects', () => {
        expect(isEqualJSON([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBe(true);
      });

      test('should return false for arrays containing objects that differ', () => {
        expect(isEqualJSON([{ a: 1 }], [{ a: 2 }])).toBe(false);
      });

      test('should return false for an array compared to an object', () => {
        expect(isEqualJSON([], {})).toBe(false);
      });
    });

    describe('objects', () => {
      test('should return true for two empty objects', () => {
        expect(isEqualJSON({}, {})).toBe(true);
      });

      test('should return true for two equal flat objects', () => {
        expect(isEqualJSON({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
      });

      test('should return false for objects with different values', () => {
        expect(isEqualJSON({ a: 1 }, { a: 2 })).toBe(false);
      });

      test('should return false for objects with different keys', () => {
        expect(isEqualJSON({ a: 1 }, { b: 1 })).toBe(false);
      });

      test('should return false for objects with different number of keys', () => {
        expect(isEqualJSON({ a: 1, b: 2 }, { a: 1 })).toBe(false);
      });

      test('should return true regardless of key insertion order', () => {
        expect(isEqualJSON({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
      });

      test('should return true for equal nested objects', () => {
        expect(isEqualJSON({ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } })).toBe(true);
      });

      test('should return false for nested objects where a deep value differs', () => {
        expect(isEqualJSON({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
      });

      test('should return true for objects with equal array values', () => {
        expect(isEqualJSON({ a: [1, 2, 3] }, { a: [1, 2, 3] })).toBe(true);
      });

      test('should return false for objects with differing array values', () => {
        expect(isEqualJSON({ a: [1, 2, 3] }, { a: [1, 2, 4] })).toBe(false);
      });

      test('should return true for objects with null values', () => {
        expect(isEqualJSON({ a: null }, { a: null })).toBe(true);
      });

      test('should return false for object compared to null', () => {
        expect(isEqualJSON({}, null)).toBe(false);
      });
    });
  });

  describe('setJSONPath', () => {
    describe('dot notation', () => {
      test('should set a top-level key on an empty object', () => {
        expect(setJSONPath({}, 'foo', 42)).toEqual({ foo: 42 });
      });

      test('should set a nested key using dot notation', () => {
        expect(setJSONPath({}, 'foo.bar', 42)).toEqual({ foo: { bar: 42 } });
      });

      test('should set a deeply nested key using dot notation', () => {
        expect(setJSONPath({}, 'a.b.c.d', 42)).toEqual({ a: { b: { c: { d: 42 } } } });
      });

      test('should overwrite an existing top-level key', () => {
        expect(setJSONPath({ foo: 1 }, 'foo', 2)).toEqual({ foo: 2 });
      });

      test('should overwrite an existing nested key', () => {
        expect(setJSONPath({ foo: { bar: 1 } }, 'foo.bar', 2)).toEqual({ foo: { bar: 2 } });
      });

      test('should preserve sibling keys when setting a top-level key', () => {
        expect(setJSONPath({ a: 1, b: 2 }, 'a', 3)).toEqual({ a: 3, b: 2 });
      });

      test('should preserve sibling keys when setting a nested key', () => {
        expect(setJSONPath({ foo: { a: 1, b: 2 } }, 'foo.a', 3)).toEqual({ foo: { a: 3, b: 2 } });
      });
    });

    describe('bracket notation', () => {
      test('should set a key using single-quote bracket notation', () => {
        expect(setJSONPath({}, "foo['bar']", 42)).toEqual({ foo: { bar: 42 } });
      });

      test('should set a key using double-quote bracket notation', () => {
        expect(setJSONPath({}, 'foo["bar"]', 42)).toEqual({ foo: { bar: 42 } });
      });
    });

    describe('array index notation', () => {
      test('should set an element in an existing array by index', () => {
        expect(setJSONPath({ arr: [1, 2, 3] }, 'arr[1]', 99)).toEqual({ arr: [1, 99, 3] });
      });

      test('should create an array and set an element by index', () => {
        expect(setJSONPath({}, 'arr[0]', 42)).toEqual({ arr: [42] });
      });
    });

    describe('mixed notation', () => {
      test('should handle a mix of dot notation and array index', () => {
        expect(setJSONPath({}, 'foo.bar[0].baz', 42)).toEqual({ foo: { bar: [{ baz: 42 }] } });
      });

      test('should handle a mix of dot notation and bracket notation', () => {
        expect(setJSONPath({}, "foo['bar'].baz", 42)).toEqual({ foo: { bar: { baz: 42 } } });
      });
    });

    describe('value types', () => {
      test('should set a null value', () => {
        expect(setJSONPath({}, 'foo', null)).toEqual({ foo: null });
      });

      test('should set a string value', () => {
        expect(setJSONPath({}, 'foo', 'hello')).toEqual({ foo: 'hello' });
      });

      test('should set a boolean value', () => {
        expect(setJSONPath({}, 'foo', true)).toEqual({ foo: true });
      });

      test('should set an array value', () => {
        expect(setJSONPath({}, 'foo', [1, 2, 3])).toEqual({ foo: [1, 2, 3] });
      });

      test('should set an object value', () => {
        expect(setJSONPath({}, 'foo', { a: 1 })).toEqual({ foo: { a: 1 } });
      });
    });

    describe('immutability', () => {
      test('should not mutate the original object', () => {
        const original = { a: 1 };
        setJSONPath(original, 'a', 2);
        expect(original).toEqual({ a: 1 });
      });

      test('should not mutate deeply nested objects in the original', () => {
        const original = { foo: { bar: 1 } };
        setJSONPath(original, 'foo.bar', 2);
        expect(original).toEqual({ foo: { bar: 1 } });
      });

      test('should return a new object reference', () => {
        const original = { a: 1 };
        expect(setJSONPath(original, 'a', 2)).not.toBe(original);
      });
    });
  });
});
