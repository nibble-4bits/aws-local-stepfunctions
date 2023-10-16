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
    const stateName = 'FailState';
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const failStateAction = new FailStateAction(definition, stateName);
    const failStateResult = failStateAction.execute(input, context);

    await expect(failStateResult).rejects.toThrow(FailStateError);
    await expect(failStateResult).rejects.toThrow('Execution failed because of a Fail state');
  });

  test('should throw `FailStateError` with `Error` value as the error name', async () => {
    const definition: FailState = {
      Type: 'Fail',
      Error: 'Failure',
    };
    const stateName = 'FailState';
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const failStateAction = new FailStateAction(definition, stateName);
    try {
      await failStateAction.execute(input, context);
    } catch (e) {
      const error = e as Error;
      expect(error).toBeInstanceOf(FailStateError);
      expect(error.name).toBe('Failure');
    }
  });

  test('should throw `FailStateError` with `Cause` value as error message', async () => {
    const definition: FailState = {
      Type: 'Fail',
      Error: 'Failure',
      Cause: 'This is the cause of the error',
    };
    const stateName = 'FailState';
    const input = {
      prop1: 'test',
      prop2: 12345,
    };
    const context = {};

    const failStateAction = new FailStateAction(definition, stateName);
    try {
      await failStateAction.execute(input, context);
    } catch (e) {
      const error = e as Error;
      expect(error).toBeInstanceOf(FailStateError);
      expect(error.message).toBe('This is the cause of the error');
    }
  });

  test('should throw `FailStateError` with value specified in `ErrorPath` field as the error name', async () => {
    const definition: FailState = {
      Type: 'Fail',
      ErrorPath: '$.error.name',
    };
    const stateName = 'FailState';
    const input = {
      prop1: 'test',
      prop2: 12345,
      error: { name: 'Failure' },
    };
    const context = {};

    const failStateAction = new FailStateAction(definition, stateName);
    try {
      await failStateAction.execute(input, context);
    } catch (e) {
      const error = e as Error;
      expect(error).toBeInstanceOf(FailStateError);
      expect(error.name).toBe('Failure');
    }
  });

  test('should throw `FailStateError` with value specified in `CausePath` field as error message', async () => {
    const definition: FailState = {
      Type: 'Fail',
      Error: 'Failure',
      CausePath: '$.cause.of.error',
    };
    const stateName = 'FailState';
    const input = {
      prop1: 'test',
      prop2: 12345,
      cause: { of: { error: 'This is the cause of the error' } },
    };
    const context = {};

    const failStateAction = new FailStateAction(definition, stateName);
    try {
      await failStateAction.execute(input, context);
    } catch (e) {
      const error = e as Error;
      expect(error).toBeInstanceOf(FailStateError);
      expect(error.message).toBe('This is the cause of the error');
    }
  });
});
