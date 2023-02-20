import type { StateMachineDefinition } from '../src/typings/StateMachineDefinition';
import { StateMachine } from '../src/StateMachine';

afterEach(() => {
  jest.clearAllMocks();
});

describe('State Machine', () => {
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
