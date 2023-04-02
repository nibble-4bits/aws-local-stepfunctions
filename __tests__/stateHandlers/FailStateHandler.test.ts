import type { FailState } from '../../src/typings/FailState';
import { FailStateAction } from '../../src/stateMachine/stateActions/FailStateAction';

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

    const failStateAction = new FailStateAction(definition);
    const { isEndState } = await failStateAction.execute(input, context);

    expect(isEndState).toBe(true);
  });
});
