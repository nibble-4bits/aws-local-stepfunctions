import type { WaitState } from '../../src/typings/WaitState';
import { WaitStateHandler } from '../../src/stateHandlers/WaitStateHandler';
import * as utilModule from '../../src/util';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Wait State', () => {
  const mockSleepFunction = jest.fn();
  const mockDateNowFunction = jest.fn(() => 1670198400000); // 2022-12-05T00:00:00Z

  beforeEach(() => {
    jest.spyOn(utilModule, 'sleep').mockImplementation(mockSleepFunction);
    jest.spyOn(Date, 'now').mockImplementation(mockDateNowFunction);
  });

  test('should pause execution for the amount of seconds specified in the `Seconds` field', async () => {
    const definition: WaitState = {
      Type: 'Wait',
      Seconds: 10,
      End: true,
    };
    const input = { prop1: 'test', prop2: 12345 };
    const context = {};

    const waitStateHandler = new WaitStateHandler(definition);
    const { stateResult } = await waitStateHandler.executeState(input, context);

    expect(mockSleepFunction).toHaveBeenCalledWith(10000, undefined);
    expect(stateResult).toEqual({ prop1: 'test', prop2: 12345 });
  });

  test('should pause execution until time in `Timestamp` field is reached', async () => {
    const definition: WaitState = {
      Type: 'Wait',
      Timestamp: '2022-12-05T05:45:00Z',
      End: true,
    };
    const input = { prop1: 'test', prop2: 12345 };
    const context = {};

    const waitStateHandler = new WaitStateHandler(definition);
    const { stateResult } = await waitStateHandler.executeState(input, context);

    expect(mockSleepFunction).toHaveBeenCalledWith(20700000, undefined);
    expect(stateResult).toEqual({ prop1: 'test', prop2: 12345 });
  });

  test('should pause execution for the amount of seconds specified in the field referenced by `SecondsPath`', async () => {
    const definition: WaitState = {
      Type: 'Wait',
      SecondsPath: '$.waitFor',
      End: true,
    };
    const input = { waitFor: 10 };
    const context = {};

    const waitStateHandler = new WaitStateHandler(definition);
    const { stateResult } = await waitStateHandler.executeState(input, context);

    expect(mockSleepFunction).toHaveBeenCalledWith(10000, undefined);
    expect(stateResult).toEqual({ waitFor: 10 });
  });

  test('should pause execution until time specified in the field referenced by `TimestampPath` is reached', async () => {
    const definition: WaitState = {
      Type: 'Wait',
      TimestampPath: '$.waitUntil',
      End: true,
    };
    const input = { waitUntil: '2022-12-05T05:45:00Z' };
    const context = {};

    const waitStateHandler = new WaitStateHandler(definition);
    const { stateResult } = await waitStateHandler.executeState(input, context);

    expect(mockSleepFunction).toHaveBeenCalledWith(20700000, undefined);
    expect(stateResult).toEqual({ waitUntil: '2022-12-05T05:45:00Z' });
  });

  test('should pause execution for the specified amount of milliseconds if wait time override option is set', async () => {
    const definition: WaitState = {
      Type: 'Wait',
      TimestampPath: '$.waitUntil',
      End: true,
    };
    const input = { waitUntil: '2022-12-05T05:45:00Z' };
    const context = {};
    const abortSignal = new AbortController().signal;
    const options = { waitTimeOverrideOption: 1500, abortSignal };

    const waitStateHandler = new WaitStateHandler(definition);
    const { stateResult } = await waitStateHandler.executeState(input, context, options);

    expect(mockSleepFunction).toHaveBeenCalledTimes(1);
    expect(mockSleepFunction).toHaveBeenCalledWith(1500, abortSignal);
    expect(stateResult).toEqual({ waitUntil: '2022-12-05T05:45:00Z' });
  });
});
