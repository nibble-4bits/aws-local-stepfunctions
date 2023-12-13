import type { TaskState } from '../src/typings/TaskState';
import { StateExecutor } from '../src/stateMachine/StateExecutor';
import { EventLogger } from '../src/stateMachine/EventLogger';
import * as utilModule from '../src/util';

// NOTE: We need to import the custom matcher declarations, since VSCode doesn't recognize custom tsconfigs
// See: https://github.com/microsoft/vscode/issues/12463
import './_customMatchers';

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
    const sleepFnMock = jest.fn();

    beforeEach(() => {
      sleepFnMock.mockClear();
      jest.spyOn(utilModule, 'sleep').mockImplementation(sleepFnMock);
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
        eventLogger: new EventLogger(),
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
        eventLogger: new EventLogger(),
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
        eventLogger: new EventLogger(),
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
        eventLogger: new EventLogger(),
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

    test('should wait at most the number of seconds specified in `MaxDelaySeconds`', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['CustomError'],
            IntervalSeconds: 3,
            MaxDelaySeconds: 8,
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      const abortSignal = new AbortController().signal;
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult } = await stateExecutor.execute(input, context, {
        abortSignal,
        eventLogger: new EventLogger(),
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
      expect(sleepFnMock).toHaveBeenNthCalledWith(1, 3000, abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(2, 6000, abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(3, 8000, abortSignal);
    });

    test('should wait a random amount of seconds if `JitterStrategy` is set to `FULL`', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['CustomError'],
            JitterStrategy: 'FULL',
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      const abortSignal = new AbortController().signal;
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult } = await stateExecutor.execute(input, context, {
        abortSignal,
        eventLogger: new EventLogger(),
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
      expect(sleepFnMock).toHaveBeenNthCalledWith(1, expect.numberBetween(0, 1000), abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(2, expect.numberBetween(0, 2000), abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(3, expect.numberBetween(0, 4000), abortSignal);
    });

    test('should wait for the specified amount of milliseconds if retry interval override option is set and is a single number', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['CustomError'],
            IntervalSeconds: 3,
            MaxDelaySeconds: 8,
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      const abortSignal = new AbortController().signal;
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult } = await stateExecutor.execute(input, context, {
        abortSignal,
        eventLogger: new EventLogger(),
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
            retryIntervalOverrides: {
              TaskState: 100,
            },
          },
        },
      });

      expect(stateResult).toBe(1);
      expect(sleepFnMock).toHaveBeenNthCalledWith(1, 100, abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(2, 100, abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(3, 100, abortSignal);
    });

    test('should wait for the specified amount of milliseconds if retry interval override option is set and is an array', async () => {
      const stateDefinition: TaskState = {
        Type: 'Task',
        Resource: 'mock-arn',
        Retry: [
          {
            ErrorEquals: ['CustomError'],
            IntervalSeconds: 3,
            MaxDelaySeconds: 8,
          },
          {
            ErrorEquals: ['SyntaxError'],
            IntervalSeconds: 3,
            MaxDelaySeconds: 8,
          },
          {
            ErrorEquals: ['RangeError'],
            IntervalSeconds: 3,
            MaxDelaySeconds: 8,
          },
        ],
        End: true,
      };
      const input = {};
      const context = {};
      const abortSignal = new AbortController().signal;
      let retryCount = 0;

      const stateExecutor = new StateExecutor('TaskState', stateDefinition);
      const { stateResult } = await stateExecutor.execute(input, context, {
        abortSignal,
        eventLogger: new EventLogger(),
        stateMachineOptions: undefined,
        runOptions: {
          overrides: {
            taskResourceLocalHandlers: {
              TaskState: async () => {
                if (retryCount === 0) {
                  retryCount++;
                  throw new CustomError('Task state failed');
                }
                if (retryCount === 1) {
                  retryCount++;
                  throw new SyntaxError('Task state failed');
                }
                if (retryCount === 2) {
                  retryCount++;
                  throw new RangeError('Task state failed');
                }

                return 1;
              },
            },
            retryIntervalOverrides: {
              TaskState: [50, 125, 250],
            },
          },
        },
      });

      expect(stateResult).toBe(1);
      expect(sleepFnMock).toHaveBeenNthCalledWith(1, 50, abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(2, 125, abortSignal);
      expect(sleepFnMock).toHaveBeenNthCalledWith(3, 250, abortSignal);
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
          eventLogger: new EventLogger(),
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
        eventLogger: new EventLogger(),
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
        eventLogger: new EventLogger(),
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
        eventLogger: new EventLogger(),
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
        eventLogger: new EventLogger(),
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
          eventLogger: new EventLogger(),
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
