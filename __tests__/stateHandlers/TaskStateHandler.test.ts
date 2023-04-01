import type { TaskState } from '../../src/typings/TaskState';
import { LambdaClient } from '../../src/aws/LambdaClient';
import { TaskStateHandler } from '../../src/stateMachine/stateHandlers/TaskStateHandler';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Task State Handler', () => {
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
    const input = { input1: 'input string', input2: 10 };
    const context = {};

    const taskStateHandler = new TaskStateHandler(definition);
    await taskStateHandler.executeState(input, context);

    expect(mockInvokeFunction).toHaveBeenCalledWith('mock-arn', { input1: 'input string', input2: 10 });
  });

  test('should return result from invoked Lambda function', async () => {
    const definition: TaskState = {
      Type: 'Task',
      Resource: 'mock-arn',
      End: true,
    };
    const input = { num1: 5, num2: 3 };
    const context = {};

    mockInvokeFunction.mockReturnValue(input.num1 + input.num2);

    const taskStateHandler = new TaskStateHandler(definition);
    const { stateResult } = await taskStateHandler.executeState(input, context);

    expect(mockInvokeFunction).toHaveBeenCalledWith('mock-arn', { num1: 5, num2: 3 });
    expect(stateResult).toBe(8);
  });

  test('should call function specified in local handler override option instead of invoking Lambda function', async () => {
    const definition: TaskState = {
      Type: 'Task',
      Resource: 'mock-arn',
      End: true,
    };
    const input = { num1: 5, num2: 3 };
    const context = {};

    const localHandlerFn = jest.fn((event) => event.num1 + event.num2);
    const options = { overrideFn: localHandlerFn };

    const taskStateHandler = new TaskStateHandler(definition);
    const { stateResult } = await taskStateHandler.executeState(input, context, options);

    expect(localHandlerFn).toHaveBeenCalledWith(input);
    expect(mockInvokeFunction).not.toHaveBeenCalled();
    expect(stateResult).toBe(8);
  });
});
