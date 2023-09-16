import { isPlainObj, sleep, isRFC3339Timestamp } from '../../src/util';

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

    test('should resolve promise when sleep is aborted using `rootAbortController` argument', async () => {
      const abortController = new AbortController();
      const rootAbortController = new AbortController();

      const sleepPromise = sleep(1000, abortController.signal, rootAbortController.signal);
      rootAbortController.abort();

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
});
