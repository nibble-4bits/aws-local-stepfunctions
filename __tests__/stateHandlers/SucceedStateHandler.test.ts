import type { SucceedState } from '../../src/typings/SucceedState';
import { SucceedStateHandler } from '../../src/stateHandlers/SucceedStateHandler';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Succeed State', () => {
  test('should return input as result', async () => {
    const definition: SucceedState = {
      Type: 'Succeed',
    };
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const succeedStateHandler = new SucceedStateHandler(definition);
    const { stateResult } = await succeedStateHandler.executeState(input, context);

    expect(stateResult).toEqual({
      prop1: 'test',
      prop2: 12345,
    });
  });

  test('should return true for end state flag', async () => {
    const definition: SucceedState = {
      Type: 'Succeed',
    };
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const succeedStateHandler = new SucceedStateHandler(definition);
    const { isEndState } = await succeedStateHandler.executeState(input, context);

    expect(isEndState).toBe(true);
  });
});
