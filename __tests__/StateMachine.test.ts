import type { StateMachineDefinition } from '../src/typings/StateMachineDefinition';
import { StateMachine } from '../src/StateMachine';
import * as ChoiceHelperModule from '../src/ChoiceHelper';
import * as utilModule from '../src/util';

afterEach(() => {
  jest.clearAllMocks();
});

describe('State Machine', () => {
  describe('Pass State', () => {
    test('should return initial input as result if neither `Result` nor `ResultPath` are specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        prop1: 'test',
        prop2: 12345,
      });
    });

    test('should return value of `Result` as result if `ResultPath` is not specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Result: {
              result1: 'result1',
              result2: 67890,
            },
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        result1: 'result1',
        result2: 67890,
      });
    });

    test('should return concatenation of initial input with itself if `ResultPath` is specified but `Result` is not specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            ResultPath: '$.concatenated',
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        prop1: 'test',
        prop2: 12345,
        concatenated: {
          prop1: 'test',
          prop2: 12345,
        },
      });
    });

    test('should return concatenation of initial input with `Result` if `ResultPath` is specified', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            ResultPath: '$.concatenated',
            Result: {
              result1: 'result1',
              result2: 67890,
            },
            End: true,
          },
        },
      };
      const input = {
        prop1: 'test',
        prop2: 12345,
      };

      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(result).toEqual({
        prop1: 'test',
        prop2: 12345,
        concatenated: {
          result1: 'result1',
          result2: 67890,
        },
      });
    });
  });

  describe('Wait State', () => {
    const mockSleepFunction = jest.fn();
    const mockDateNowFunction = jest.fn(() => 1670198400000); // 2022-12-05T00:00:00Z

    beforeEach(() => {
      jest.spyOn(utilModule, 'sleep').mockImplementation(mockSleepFunction);
      jest.spyOn(Date, 'now').mockImplementation(mockDateNowFunction);
    });

    test('should pause execution for the amount of seconds specified in the `Seconds` field', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'WaitState',
        States: {
          WaitState: {
            Type: 'Wait',
            Seconds: 10,
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(10000);
    });

    test('should pause execution until time in `Timestamp` field is reached', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'WaitState',
        States: {
          WaitState: {
            Type: 'Wait',
            Timestamp: '2022-12-05T05:45:00Z',
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(20700000);
    });

    test('should pause execution for the amount of seconds specified in the field referenced by `SecondsPath`', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Parameters: { waitFor: 10 },
            Next: 'WaitState',
          },
          WaitState: {
            Type: 'Wait',
            SecondsPath: '$.waitFor',
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(10000);
    });

    test('should pause execution until time specified in the field referenced by `TimestampPath` is reached', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Parameters: { waitUntil: '2022-12-05T05:45:00Z' },
            Next: 'WaitState',
          },
          WaitState: {
            Type: 'Wait',
            TimestampPath: '$.waitUntil',
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input);

      expect(mockSleepFunction).toHaveBeenCalledWith(20700000);
    });

    test('should pause execution for the specified amount of milliseconds if wait time override option is set', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'PassState',
        States: {
          PassState: {
            Type: 'Pass',
            Parameters: { waitUntil: '2022-12-05T05:45:00Z' },
            Next: 'WaitState',
          },
          WaitState: {
            Type: 'Wait',
            TimestampPath: '$.waitUntil',
            End: true,
          },
        },
      };
      const input = {};

      const stateMachine = new StateMachine(definition);
      await stateMachine.run(input, {
        overrides: {
          waitTimeOverrides: {
            WaitState: 1500,
          },
        },
      });

      expect(mockSleepFunction).toHaveBeenCalledTimes(1);
      expect(mockSleepFunction).toHaveBeenCalledWith(1500);
    });
  });

  describe('Choice State', () => {
    test('should transition to state that matches choice rule', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'ChoiceState',
        States: {
          ChoiceState: {
            Type: 'Choice',
            Choices: [
              {
                Variable: '$.testNumberValue',
                NumericEquals: 20,
                Next: 'FailState',
              },
              {
                Variable: '$.testStringValue',
                StringEquals: 'test',
                Next: 'MatchingChoice',
              },
              {
                Variable: '$.testBooleanValue',
                BooleanEquals: false,
                Next: 'FailState',
              },
            ],
            Default: 'FailState',
          },
          FailState: {
            Type: 'Fail',
          },
          MatchingChoice: {
            Type: 'Pass',
            Result: {
              matchingChoiceResult: 'in matching choice state',
            },
            End: true,
          },
        },
      };
      const input = { testNumberValue: 50, testStringValue: 'test', testBooleanValue: true };

      const testChoiceRuleSpy = jest.spyOn(ChoiceHelperModule, 'testChoiceRule');
      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(testChoiceRuleSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        matchingChoiceResult: 'in matching choice state',
      });
    });

    test('should transition to state specified in `Default` if none of the choices match', async () => {
      const definition: StateMachineDefinition = {
        StartAt: 'ChoiceState',
        States: {
          ChoiceState: {
            Type: 'Choice',
            Choices: [
              {
                Variable: '$.testNumberValue',
                NumericEquals: 20,
                Next: 'FailState',
              },
              {
                Variable: '$.testStringValue',
                StringEquals: 'not test',
                Next: 'FailState',
              },
            ],
            Default: 'DefaultChoice',
          },
          FailState: {
            Type: 'Fail',
          },
          DefaultChoice: {
            Type: 'Pass',
            Result: {
              defaultChoiceResult: 'in default choice state',
            },
            End: true,
          },
        },
      };
      const input = { testNumberValue: 50, testStringValue: 'test' };

      const testChoiceRuleSpy = jest.spyOn(ChoiceHelperModule, 'testChoiceRule');
      const stateMachine = new StateMachine(definition);
      const result = await stateMachine.run(input);

      expect(testChoiceRuleSpy).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        defaultChoiceResult: 'in default choice state',
      });
    });
  });

  describe('Succeed State', () => {
    // Placeholder for Succeed state tests
  });

  describe('Fail State', () => {
    // Placeholder for Fail state tests
  });
});
