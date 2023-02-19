import type { StateMachineDefinition } from '../src/typings/StateMachineDefinition';
import { StateMachine } from '../src/StateMachine';
import * as ChoiceHelperModule from '../src/ChoiceHelper';

afterEach(() => {
  jest.clearAllMocks();
});

describe('State Machine', () => {
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
