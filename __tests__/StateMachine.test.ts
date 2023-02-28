import type { StateMachineDefinition } from '../src/typings/StateMachineDefinition';
import { StateMachine } from '../src/StateMachine';
import { ExecutionAbortedError } from '../src/error/ExecutionAbortedError';

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
      const validationOptions = { checkArn: false };

      expect(() => {
        new StateMachine(stateMachineDefinition, validationOptions);
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
      const validationOptions = { checkPaths: false };

      expect(() => {
        new StateMachine(stateMachineDefinition, validationOptions);
      }).not.toThrow();
    });
  });

  describe('run()', () => {
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

      await expect(() => execution.result).rejects.toThrow(ExecutionAbortedError);
    });

    test('should not throw on abort and return `null` if `noThrowOnAbort` option is passed', async () => {
      const input = {};

      const stateMachine = new StateMachine(machineDefinition);
      const execution = stateMachine.run(input, { noThrowOnAbort: true });

      execution.abort();

      await expect(execution.result).resolves.toBe(null);
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
  });
});
