import type { TaskState } from '../../src/typings/TaskState';
import { LambdaClient } from '../../src/aws/LambdaClient';
import { TaskStateAction } from '../../src/stateMachine/stateActions/TaskStateAction';
import { StatesTimeoutError } from '../../src/error/predefined/StatesTimeoutError';
import { sleep } from '../../src/util';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Task State', () => {
  const mockInvokeFunction = jest.fn();

  beforeEach(() => {
    jest.spyOn(LambdaClient.prototype, 'invokeFunction').mockImplementation(mockInvokeFunction);
  });

  test('should invoke Lambda function specified in `Resource` field', async () => {
    const definition: TaskState = {
      Type: 'Task',
      Resource: 'mock-arn',
      End: true,
    };
    const stateName = 'TaskState';
    const input = { input1: 'input string', input2: 10 };
    const context = {};
    const options = { overrideFn: undefined, awsConfig: undefined };

    const taskStateAction = new TaskStateAction(definition, stateName);
    await taskStateAction.execute(input, context, options);

    expect(mockInvokeFunction).toHaveBeenCalledWith('mock-arn', { input1: 'input string', input2: 10 });
  });

  test('should return result from invoked Lambda function', async () => {
    const definition: TaskState = {
      Type: 'Task',
      Resource: 'mock-arn',
      End: true,
    };
    const stateName = 'TaskState';
    const input = { num1: 5, num2: 3 };
    const context = {};
    const options = { overrideFn: undefined, awsConfig: undefined };

    mockInvokeFunction.mockReturnValue(input.num1 + input.num2);

    const taskStateAction = new TaskStateAction(definition, stateName);
    const { stateResult } = await taskStateAction.execute(input, context, options);

    expect(mockInvokeFunction).toHaveBeenCalledWith('mock-arn', { num1: 5, num2: 3 });
    expect(stateResult).toBe(8);
  });

  test('should call function specified in local handler override option instead of invoking Lambda function', async () => {
    const definition: TaskState = {
      Type: 'Task',
      Resource: 'mock-arn',
      End: true,
    };
    const stateName = 'TaskState';
    const input = { num1: 5, num2: 3 };
    const context = {};

    const localHandlerFn = jest.fn((event) => event.num1 + event.num2);
    const options = { overrideFn: localHandlerFn, awsConfig: undefined };

    const taskStateAction = new TaskStateAction(definition, stateName);
    const { stateResult } = await taskStateAction.execute(input, context, options);

    expect(localHandlerFn).toHaveBeenCalledWith(input);
    expect(mockInvokeFunction).not.toHaveBeenCalled();
    expect(stateResult).toBe(8);
  });

  test('should throw `States.Timeout` error if action runs longer than the value specified in `TimeoutSeconds` field', async () => {
    const definition: TaskState = {
      Type: 'Task',
      Resource: 'mock-arn',
      TimeoutSeconds: 1,
      End: true,
    };
    const stateName = 'TaskState';
    const input = { num1: 5, num2: 3 };
    const context = {};

    const localHandlerFn = async () => {
      await sleep(1100);
      return 1;
    };
    const options = { overrideFn: localHandlerFn, awsConfig: undefined };

    const taskStateAction = new TaskStateAction(definition, stateName);

    await expect(() => taskStateAction.execute(input, context, options)).rejects.toThrow(StatesTimeoutError);
  });

  test('should throw `States.Timeout` error if action runs longer than the value specified in `TimeoutSecondsPath` field', async () => {
    const definition: TaskState = {
      Type: 'Task',
      Resource: 'mock-arn',
      TimeoutSecondsPath: '$.taskTimeout',
      End: true,
    };
    const stateName = 'TaskState';
    const input = { num1: 5, num2: 3, taskTimeout: 1 };
    const context = {};

    const localHandlerFn = async () => {
      await sleep(1100);
      return 1;
    };
    const options = { overrideFn: localHandlerFn, awsConfig: undefined };

    const taskStateAction = new TaskStateAction(definition, stateName);

    await expect(() => taskStateAction.execute(input, context, options)).rejects.toThrow(StatesTimeoutError);
  });
});
