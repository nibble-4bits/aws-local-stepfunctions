import type { StateMachineDefinition } from '../src/typings/StateMachineDefinition';
import type { EventLog } from '../src/typings/EventLogs';
import { StateMachine } from '../src/stateMachine/StateMachine';
import { ExecutionAbortedError } from '../src/error/ExecutionAbortedError';
import { ExecutionTimeoutError } from '../src/error/ExecutionTimeoutError';
import { ExecutionError } from '../src/error/ExecutionError';

afterEach(() => {
  jest.clearAllMocks();
});

describe('State Machine', () => {
  describe('constructor', () => {
    test('should validate ARNs by default when creating instance', async () => {
      const stateMachineDefinition: StateMachineDefinition = {
        StartAt: 'FirstState',
        States: {
          FirstState: {
            Type: 'Task',
            Resource: 'mock-arn',
            End: true,
          },
        },
      };

      expect(() => {
        new StateMachine(stateMachineDefinition);
      }).toThrow();
    });

    test('should validate JSON paths by default when creating instance', async () => {
      const stateMachineDefinition: StateMachineDefinition = {
        StartAt: 'FirstState',
        States: {
          FirstState: {
            Type: 'Pass',
            InputPath: 'invalidPath',
            ResultPath: 'invalidPath',
            OutputPath: 'invalidPath',
            End: true,
          },
        },
      };

      expect(() => {
        new StateMachine(stateMachineDefinition);
      }).toThrow();
    });

    test('should not throw if ARN validation is turned off when creating instance', async () => {
      const stateMachineDefinition: StateMachineDefinition = {
        StartAt: 'FirstState',
        States: {
          FirstState: {
            Type: 'Task',
            Resource: 'mock-arn',
            End: true,
          },
        },
      };
      const stateMachineOptions = { validationOptions: { checkArn: false } };

      expect(() => {
        new StateMachine(stateMachineDefinition, stateMachineOptions);
      }).not.toThrow();
    });

    test('should not throw if JSON paths validation is turned off when creating instance', async () => {
      const stateMachineDefinition: StateMachineDefinition = {
        StartAt: 'FirstState',
        States: {
          FirstState: {
            Type: 'Pass',
            InputPath: 'invalidPath',
            ResultPath: 'invalidPath',
            OutputPath: 'invalidPath',
            End: true,
          },
        },
      };
      const stateMachineOptions = { validationOptions: { checkPaths: false } };

      expect(() => {
        new StateMachine(stateMachineDefinition, stateMachineOptions);
      }).not.toThrow();
    });

    test('should not throw if definition validation is completely turned off when creating instance', async () => {
      const stateMachineDefinition: StateMachineDefinition = {
        StartAt: 'FirstState',
        States: {
          FirstState: {
            Type: 'Pass',
            InputPath: 'invalidPath',
            ResultPath: 'invalidPath',
            OutputPath: 'invalidPath',
            End: true,
          },
          UnreachableState: {
            // @ts-expect-error Invalid state type
            Type: 'InvalidType',
          },
        },
        InvalidTopLevelField: {},
      };
      const stateMachineOptions = { validationOptions: { noValidate: true } };

      expect(() => {
        new StateMachine(stateMachineDefinition, stateMachineOptions);
      }).not.toThrow();
    });
  });

  describe('run()', () => {
    const mockDateNowFunction = jest.fn(() => 1670198400000); // 2022-12-05T00:00:00Z

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockImplementation(mockDateNowFunction);
    });

    const machineDefinition: StateMachineDefinition = {
      StartAt: 'PassState',
      States: {
        PassState: {
          Type: 'Pass',
          End: true,
        },
      },
    };

    test('should throw on abort if `noThrowOnAbort` option is not passed', async () => {
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input);

      execution.abort();

      await expect(execution.result).rejects.toThrow(ExecutionAbortedError);
    });

    test('should return `null` if `noThrowOnAbort` option is passed', async () => {
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input, { noThrowOnAbort: true });

      execution.abort();

      await expect(execution.result).resolves.toBe(null);
    });

    test('should throw an `ExecutionTimeoutError` error if execution times out', async () => {
      const machineDefinition: StateMachineDefinition = {
        StartAt: 'WaitState',
        TimeoutSeconds: 1,
        States: {
          WaitState: {
            Type: 'Wait',
            Seconds: 3,
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input);

      await expect(execution.result).rejects.toThrow(ExecutionTimeoutError);
    });

    test('should throw an `ExecutionError` if execution fails', async () => {
      const machineDefinition: StateMachineDefinition = {
        StartAt: 'FailState',
        States: {
          FailState: {
            Type: 'Fail',
            Error: 'Failure',
            Cause: 'This is the cause of the error',
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input);

      await expect(execution.result).rejects.toThrow(ExecutionError);
    });

    test('should return result of last state as execution result', async () => {
      const machineDefinition: StateMachineDefinition = {
        StartAt: 'PassState1',
        States: {
          PassState1: {
            Type: 'Pass',
            Result: 1,
            Next: 'PassState2',
          },
          PassState2: {
            Type: 'Pass',
            Result: 2,
            Next: 'PassState3',
          },
          PassState3: {
            Type: 'Pass',
            Result: 3,
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input);

      await expect(execution.result).resolves.toBe(3);
    });

    test('should generate event logs in expected order', async () => {
      const machineDefinition: StateMachineDefinition = {
        StartAt: 'PassState1',
        States: {
          PassState1: {
            Type: 'Pass',
            Result: 1,
            Next: 'PassState2',
          },
          PassState2: {
            Type: 'Pass',
            Result: 2,
            Next: 'PassState3',
          },
          PassState3: {
            Type: 'Pass',
            Result: 3,
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input);

      const events: EventLog[] = [];
      for await (const event of execution.eventLogs) {
        events.push(event);
      }

      expect(events).toEqual([
        { type: 'ExecutionStarted', timestamp: 1670198400000, input: {} },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'PassState1', type: 'Pass', input: {} } },
        {
          type: 'StateExited',
          timestamp: 1670198400000,
          state: { name: 'PassState1', type: 'Pass', input: {}, output: 1 },
        },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'PassState2', type: 'Pass', input: 1 } },
        {
          type: 'StateExited',
          timestamp: 1670198400000,
          state: { name: 'PassState2', type: 'Pass', input: 1, output: 2 },
        },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'PassState3', type: 'Pass', input: 2 } },
        {
          type: 'StateExited',
          timestamp: 1670198400000,
          state: { name: 'PassState3', type: 'Pass', input: 2, output: 3 },
        },
        { type: 'ExecutionSucceeded', timestamp: 1670198400000, output: 3 },
      ]);
    });

    test('should generate an `ExecutionFailed` event as last event if execution fails', async () => {
      const machineDefinition: StateMachineDefinition = {
        StartAt: 'PassState1',
        States: {
          PassState1: {
            Type: 'Pass',
            Result: 1,
            Next: 'TaskState',
          },
          TaskState: {
            Type: 'Task',
            Resource: 'arn:aws:lambda:us-east-1:123456789012:function:AddNumbers',
            Retry: [{ ErrorEquals: ['SyntaxError'], MaxAttempts: 1 }],
            Catch: [{ ErrorEquals: ['SyntaxError'], Next: 'FailExecution' }],
            End: true,
          },
          FailExecution: { Type: 'Fail', Error: 'MachineFailure', Cause: 'The state machine failed' },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input, {
        overrides: {
          taskResourceLocalHandlers: {
            TaskState: () => {
              throw new SyntaxError('Unknown token at position 12');
            },
          },
        },
      });

      const events: EventLog[] = [];
      for await (const event of execution.eventLogs) {
        events.push(event);
      }

      await expect(execution.result).rejects.toThrow(ExecutionError);
      expect(events).toEqual([
        { type: 'ExecutionStarted', timestamp: 1670198400000, input: {} },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'PassState1', type: 'Pass', input: {} } },
        {
          type: 'StateExited',
          timestamp: 1670198400000,
          state: { name: 'PassState1', type: 'Pass', input: {}, output: 1 },
        },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'TaskState', type: 'Task', input: 1 } },
        {
          type: 'StateFailed',
          timestamp: 1670198400000,
          state: { name: 'TaskState', type: 'Task', input: 1 },
          Error: 'SyntaxError',
          Cause: 'Unknown token at position 12',
        },
        {
          type: 'StateRetried',
          timestamp: 1670198400000,
          state: { name: 'TaskState', type: 'Task', input: 1 },
          retry: { retrier: { ErrorEquals: ['SyntaxError'], MaxAttempts: 1 }, attempt: 1 },
        },
        {
          type: 'StateFailed',
          timestamp: 1670198400000,
          state: { name: 'TaskState', type: 'Task', input: 1 },
          Error: 'SyntaxError',
          Cause: 'Unknown token at position 12',
        },
        {
          type: 'StateCaught',
          timestamp: 1670198400000,
          state: { name: 'TaskState', type: 'Task', input: 1 },
          catch: { catcher: { ErrorEquals: ['SyntaxError'], Next: 'FailExecution' } },
        },
        {
          type: 'StateExited',
          timestamp: 1670198400000,
          state: {
            name: 'TaskState',
            type: 'Task',
            input: 1,
            output: { Error: 'SyntaxError', Cause: 'Unknown token at position 12' },
          },
        },
        {
          type: 'StateEntered',
          timestamp: 1670198400000,
          state: {
            name: 'FailExecution',
            type: 'Fail',
            input: { Error: 'SyntaxError', Cause: 'Unknown token at position 12' },
          },
        },
        {
          type: 'StateFailed',
          timestamp: 1670198400000,
          state: {
            name: 'FailExecution',
            type: 'Fail',
            input: { Error: 'SyntaxError', Cause: 'Unknown token at position 12' },
          },
          Error: 'MachineFailure',
          Cause: 'The state machine failed',
        },
        {
          type: 'ExecutionFailed',
          timestamp: 1670198400000,
          Error: 'MachineFailure',
          Cause: 'The state machine failed',
        },
      ]);
    });

    test('should generate an `ExecutionAborted` event as last event if execution is aborted', async () => {
      const machineDefinition: StateMachineDefinition = {
        StartAt: 'PassState1',
        States: {
          PassState1: {
            Type: 'Pass',
            Result: 1,
            Next: 'PassState2',
          },
          PassState2: {
            Type: 'Pass',
            Result: 2,
            Next: 'PassState3',
          },
          PassState3: {
            Type: 'Pass',
            Result: 3,
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input);

      execution.abort();

      const events: EventLog[] = [];
      for await (const event of execution.eventLogs) {
        events.push(event);
      }

      await expect(execution.result).rejects.toThrow(ExecutionAbortedError);
      expect(events).toEqual([
        { type: 'ExecutionStarted', timestamp: 1670198400000, input: {} },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'PassState1', type: 'Pass', input: {} } },
        { type: 'ExecutionAborted', timestamp: 1670198400000 },
      ]);
    });

    test('should generate an `ExecutionTimeout` event as last event if execution times out', async () => {
      const machineDefinition: StateMachineDefinition = {
        StartAt: 'PassState1',
        TimeoutSeconds: 1,
        States: {
          PassState1: {
            Type: 'Pass',
            Result: 1,
            Next: 'WaitState',
          },
          WaitState: {
            Type: 'Wait',
            Seconds: 2,
            Next: 'PassState2',
          },
          PassState2: {
            Type: 'Pass',
            Result: 2,
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input);

      const events: EventLog[] = [];
      for await (const event of execution.eventLogs) {
        events.push(event);
      }

      await expect(execution.result).rejects.toThrow(ExecutionTimeoutError);
      expect(events).toEqual([
        { type: 'ExecutionStarted', timestamp: 1670198400000, input: {} },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'PassState1', type: 'Pass', input: {} } },
        {
          type: 'StateExited',
          timestamp: 1670198400000,
          state: { name: 'PassState1', type: 'Pass', input: {}, output: 1 },
        },
        { type: 'StateEntered', timestamp: 1670198400000, state: { name: 'WaitState', type: 'Wait', input: 1 } },
        { type: 'ExecutionTimeout', timestamp: 1670198400000 },
      ]);
    });
  });
});
