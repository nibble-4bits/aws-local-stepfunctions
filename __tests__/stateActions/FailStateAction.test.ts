import type { FailState } from '../../src/typings/FailState';
import { FailStateAction } from '../../src/stateMachine/stateActions/FailStateAction';
import { FailStateError } from '../../src/error/FailStateError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Fail State', () => {
  test('should throw `FailStateError`', async () => {
    const definition: FailState = {
      Type: 'Fail',
    };
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const failStateAction = new FailStateAction(definition);
    const failStateResult = failStateAction.execute(input, context);

    await expect(failStateResult).rejects.toThrow(FailStateError);
    await expect(failStateResult).rejects.toThrow('Execution failed because of a Fail state');
  });

  test('should throw `FailStateError` with `Cause` value as error message', async () => {
    const definition: FailState = {
      Type: 'Fail',
      Error: 'Failure',
      Cause: 'This is the cause of the error',
    };
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const failStateAction = new FailStateAction(definition);
    const failStateResult = failStateAction.execute(input, context);

    await expect(failStateResult).rejects.toThrow(FailStateError);
    await expect(failStateResult).rejects.toThrow('This is the cause of the error');
  });
});
