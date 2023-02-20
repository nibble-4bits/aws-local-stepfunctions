import type { PassState } from '../../src/typings/PassState';
import { PassStateHandler } from '../../src/stateHandlers/PassStateHandler';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Pass State', () => {
  test('should return initial input as result if `Result` is not specified', async () => {
    const definition: PassState = {
      Type: 'Pass',
      End: true,
    };
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const passStateHandler = new PassStateHandler(definition);
    const { stateResult } = await passStateHandler.executeState(input, context);

    expect(stateResult).toEqual({
      prop1: 'test',
      prop2: 12345,
    });
  });

  test('should return value of `Result` as result if specified', async () => {
    const definition: PassState = {
      Type: 'Pass',
      Result: {
        result1: 'result1',
        result2: 67890,
      },
      End: true,
    };
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const passStateHandler = new PassStateHandler(definition);
    const { stateResult } = await passStateHandler.executeState(input, context);

    expect(stateResult).toEqual({
      result1: 'result1',
      result2: 67890,
    });
  });
});
