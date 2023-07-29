import { isPlainObj, sleep } from '../../src/util';

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
});
