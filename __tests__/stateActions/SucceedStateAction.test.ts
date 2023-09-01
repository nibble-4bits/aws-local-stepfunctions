import type { SucceedState } from '../../src/typings/SucceedState';
import { SucceedStateAction } from '../../src/stateMachine/stateActions/SucceedStateAction';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Succeed State', () => {
  test('should return input as result', async () => {
    const definition: SucceedState = {
      Type: 'Succeed',
    };
    const stateName = 'SucceedState';
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const succeedStateAction = new SucceedStateAction(definition, stateName);
    const { stateResult } = await succeedStateAction.execute(input, context);

    expect(stateResult).toEqual({
      prop1: 'test',
      prop2: 12345,
    });
  });

  test('should return true for end state flag', async () => {
    const definition: SucceedState = {
      Type: 'Succeed',
    };
    const stateName = 'SucceedState';
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const succeedStateAction = new SucceedStateAction(definition, stateName);
    const { isEndState } = await succeedStateAction.execute(input, context);

    expect(isEndState).toBe(true);
  });
});
