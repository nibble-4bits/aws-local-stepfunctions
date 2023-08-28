import type { TaskState } from '../src/typings/TaskState';
import { StateExecutor } from '../src/stateMachine/StateExecutor';
import * as utilModule from '../src/util';

afterEach(() => {
  jest.clearAllMocks();
});

describe('State Executor', () => {
  class CustomError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'CustomError';
    }
  }

  describe('Retry behavior', () => {
    const defaultMaxRetries = 3;

    beforeEach(() => {
      jest.spyOn(utilModule, 'sleep').mockImplementation(jest.fn());
    });

    test('should retry state if `Retry` field is specified and thrown error is specified in retrier', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['CustomError'],
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult } = await stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                if (retryCount < defaultMaxRetries) {
                  retryCount++;
                  throw new CustomError('Task state failed');
                }

                return 1;
              },
            },
          },
        },
      });

      expect(stateResult).toBe(1);
    });

    test('should retry state if retrier specifies `States.ALL` error name', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['States.ALL'],
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult } = await stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                if (retryCount < defaultMaxRetries) {
                  retryCount++;
                  throw new Error('Task state failed');
                }

                return 1;
              },
            },
          },
        },
      });

      expect(stateResult).toBe(1);
    });

    test('should throw error if retrier max attempts are exhausted', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['Error'],
            MaxAttempts: 1,
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const executorResult = stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                if (retryCount < defaultMaxRetries) {
                  retryCount++;
                  throw new Error('Task state failed');
                }

                return 1;
              },
            },
          },
        },
      });

      await expect(executorResult).rejects.toThrow();
    });

    test('should throw error if none of the retriers match', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['CustomError', 'SyntaxError'],
          },
          {
            ErrorEquals: ['SomeError'],
          },
          {
            ErrorEquals: ['LastError'],
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const executorResult = stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                if (retryCount < defaultMaxRetries) {
                  retryCount++;
                  throw new Error('Task state failed');
                }

                return 1;
              },
            },
          },
        },
      });

      await expect(executorResult).rejects.toThrow();
    });

    describe('Task state', () => {
      test('should retry state if retrier specifies `States.TaskFailed` error name', async () => {
        const stateDefinition: TaskState = {
          Type: 'Task',
          Resource: 'mock-arn',
          Retry: [
            {
              ErrorEquals: ['States.TaskFailed'],
            },
          ],
          End: true,
        };
        const input = {};
        const context = {};
        let retryCount = 0;

        const stateExecutor = new StateExecutor('TaskState', stateDefinition);
        const { stateResult } = await stateExecutor.execute(input, context, {
          abortSignal: new AbortController().signal,
          stateMachineOptions: undefined,
          runOptions: {
            overrides: {
              taskResourceLocalHandlers: {
                TaskState: async () => {
                  if (retryCount < defaultMaxRetries) {
                    retryCount++;
                    throw new Error('Task state failed');
                  }

                  return 1;
                },
              },
            },
          },
        });

        expect(stateResult).toBe(1);
      });
    });
  });

  describe('Catch behavior', () => {
    test('should catch error if `Catch` field is specified and thrown error is specified in catcher', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Catch: [
          {
            ErrorEquals: ['CustomError'],
            Next: 'FallbackState',
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult, nextState } = await stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                throw new CustomError('Task state failed');
              },
            },
          },
        },
      });

      expect(stateResult).toEqual({
        Error: 'CustomError',
        Cause: 'Task state failed',
      });
      expect(nextState).toBe('FallbackState');
    });

    test('should catch error if catcher specifies `States.ALL` error name', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Catch: [
          {
            ErrorEquals: ['States.ALL'],
            Next: 'FallbackState',
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult, nextState } = await stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                throw new CustomError('Task state failed');
              },
            },
          },
        },
      });

      expect(stateResult).toEqual({
        Error: 'CustomError',
        Cause: 'Task state failed',
      });
      expect(nextState).toBe('FallbackState');
    });

    test('should combine error output with raw input if `ResultPath` field is specified in catcher', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Catch: [
          {
            ErrorEquals: ['States.ALL'],
            Next: 'FallbackState',
            ResultPath: '$.errorOutput',
          },
        ],
        End: true,
      };
      const input = { num1: 5, num2: 3 };
      const context = {};

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult, nextState } = await stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                throw new CustomError('Task state failed');
              },
            },
          },
        },
      });

      expect(stateResult).toEqual({
        num1: 5,
        num2: 3,
        errorOutput: {
          Error: 'CustomError',
          Cause: 'Task state failed',
        },
      });
      expect(nextState).toBe('FallbackState');
    });

    test('should throw error if none of the catchers match', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Catch: [
          {
            ErrorEquals: ['CustomError', 'SyntaxError'],
            Next: 'FallbackState1',
          },
          {
            ErrorEquals: ['SomeError'],
            Next: 'FallbackState2',
          },
          {
            ErrorEquals: ['LastError'],
            Next: 'FallbackState3',
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const executorResult = stateExecutor.execute(input, context, {
        abortSignal: new AbortController().signal,
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                throw new Error('Task state failed');
              },
            },
          },
        },
      });

      await expect(executorResult).rejects.toThrow();
    });

    describe('Task state', () => {
      test('should catch error if catcher specifies `States.TaskFailed` error name', async () => {
        const stateDefinition: TaskState = {
          Type: 'Task',
          Resource: 'mock-arn',
          Catch: [
            {
              ErrorEquals: ['States.TaskFailed'],
              Next: 'FallbackState',
            },
          ],
          End: true,
        };
        const input = {};
        const context = {};

        const stateExecutor = new StateExecutor('TaskState', stateDefinition);
        const { stateResult, nextState } = await stateExecutor.execute(input, context, {
          abortSignal: new AbortController().signal,
          stateMachineOptions: undefined,
          runOptions: {
            overrides: {
              taskResourceLocalHandlers: {
                TaskState: async () => {
                  throw new CustomError('Task state failed');
                },
              },
            },
          },
        });

        expect(stateResult).toEqual({
          Error: 'CustomError',
          Cause: 'Task state failed',
        });
        expect(nextState).toBe('FallbackState');
      });
    });
  });
});
