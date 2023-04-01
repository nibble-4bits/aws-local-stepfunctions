import type { FailState } from '../../src/typings/FailState';
import { FailStateHandler } from '../../src/stateMachine/stateHandlers/FailStateHandler';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Fail State', () => {
  test('should return true for end state flag', async () => {
    const definition: FailState = {
      Type: 'Fail',
    };
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const failStateHandler = new FailStateHandler(definition);
    const { isEndState } = await failStateHandler.executeState(input, context);

    expect(isEndState).toBe(true);
  });
});
