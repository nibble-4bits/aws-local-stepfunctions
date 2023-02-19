import type { ChoiceState } from '../../src/typings/ChoiceState';
import { ChoiceStateHandler } from '../../src/stateHandlers/ChoiceStateHandler';

afterEach(() => {
  jest.clearAllMocks();
});

describe('Choice State', () => {
  describe('Choice rule matcher', () => {
    const rules = [
      {
        rule: 'StringEquals',
        cases: [
          { ruleValue: 'hello', inputValue: 'hello', explanation: 'is equal to operator value', isMatch: true },
          {
            ruleValue: 'hello',
            inputValue: 'hello, world',
            explanation: 'is not equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'StringEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'hello',
            comparisonValue: 'hello',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'hello, world',
            comparisonValue: 'hello',
            explanation: 'is not equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'StringLessThan',
        cases: [
          { ruleValue: 'b', inputValue: 'a', explanation: 'is less than operator value', isMatch: true },
          { ruleValue: 'b', inputValue: 'c', explanation: 'is greater than operator value', isMatch: false },
          { ruleValue: 'a', inputValue: 'a', explanation: 'is equal to operator value', isMatch: false },
        ],
      },
      {
        rule: 'StringLessThanPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'a',
            comparisonValue: 'b',
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'c',
            comparisonValue: 'b',
            explanation: 'is greater than operator value',
            isMatch: false,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'a',
            comparisonValue: 'a',
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'StringGreaterThan',
        cases: [
          { ruleValue: 'a', inputValue: 'b', explanation: 'is greater than operator value', isMatch: true },
          { ruleValue: 'c', inputValue: 'b', explanation: 'is less than operator value', isMatch: false },
          { ruleValue: 'a', inputValue: 'a', explanation: 'is equal to operator value', isMatch: false },
        ],
      },
      {
        rule: 'StringGreaterThanPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'b',
            comparisonValue: 'a',
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'b',
            comparisonValue: 'c',
            explanation: 'is less than operator value',
            isMatch: false,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'a',
            comparisonValue: 'a',
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'StringLessThanEquals',
        cases: [
          { ruleValue: 'b', inputValue: 'a', explanation: 'is less than operator value', isMatch: true },
          { ruleValue: 'a', inputValue: 'a', explanation: 'is equal to operator value', isMatch: true },
          { ruleValue: 'b', inputValue: 'c', explanation: 'is greater than operator value', isMatch: false },
        ],
      },
      {
        rule: 'StringLessThanEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'a',
            comparisonValue: 'b',
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'a',
            comparisonValue: 'a',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'c',
            comparisonValue: 'b',
            explanation: 'is greater than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'StringGreaterThanEquals',
        cases: [
          { ruleValue: 'b', inputValue: 'c', explanation: 'is greater than operator value', isMatch: true },
          { ruleValue: 'a', inputValue: 'a', explanation: 'is equal to operator value', isMatch: true },
          { ruleValue: 'b', inputValue: 'a', explanation: 'is less than operator value', isMatch: false },
        ],
      },
      {
        rule: 'StringGreaterThanEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'c',
            comparisonValue: 'b',
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'a',
            comparisonValue: 'a',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 'a',
            comparisonValue: 'b',
            explanation: 'is less than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'StringMatches',
        cases: [
          {
            ruleValue: 'foo*.log',
            inputValue: 'foo23.log',
            explanation: 'matches wildcards in operator value',
            isMatch: true,
          },
          {
            ruleValue: '*.log',
            inputValue: 'zebra.log',
            explanation: 'matches wildcards in operator value',
            isMatch: true,
          },
          {
            ruleValue: 'foo*.*',
            inputValue: 'foobar.zebra',
            explanation: 'matches wildcards in operator value',
            isMatch: true,
          },
          {
            ruleValue: 'foobar',
            inputValue: 'foobar',
            explanation: 'matches literal string in operator value',
            isMatch: true,
          },
          {
            ruleValue: 'foo\\*bar\\*baz',
            inputValue: 'foo*bar*baz',
            explanation: 'matches escaped wildcards in operator value',
            isMatch: true,
          },
          {
            ruleValue: 'foo*.log',
            inputValue: 'fo23.log',
            explanation: 'does not match wildcards in operator value',
            isMatch: false,
          },
          {
            ruleValue: '*.log',
            inputValue: 'zebra.slog',
            explanation: 'does not match wildcards in operator value',
            isMatch: false,
          },
          {
            ruleValue: 'foo*.*',
            inputValue: 'fobar.zebra',
            explanation: 'does not match wildcards in operator value',
            isMatch: false,
          },
          {
            ruleValue: 'foobar',
            inputValue: 'foo',
            explanation: 'does not match literal string in operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'NumericEquals',
        cases: [
          { ruleValue: 10, inputValue: 10, explanation: 'is equal to operator value', isMatch: true },
          { ruleValue: 10, inputValue: 50, explanation: 'is not equal to operator value', isMatch: false },
        ],
      },
      {
        rule: 'NumericEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 10,
            comparisonValue: 10,
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 50,
            comparisonValue: 10,
            explanation: 'is not equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'NumericLessThan',
        cases: [
          { ruleValue: 150, inputValue: 100, explanation: 'is less than operator value', isMatch: true },
          { ruleValue: 150, inputValue: 200, explanation: 'is greater than operator value', isMatch: false },
          { ruleValue: 150, inputValue: 150, explanation: 'is equal to operator value', isMatch: false },
        ],
      },
      {
        rule: 'NumericLessThanPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 100,
            comparisonValue: 150,
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 200,
            comparisonValue: 150,
            explanation: 'is greater than operator value',
            isMatch: false,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 150,
            comparisonValue: 150,
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'NumericGreaterThan',
        cases: [
          { ruleValue: 150, inputValue: 200, explanation: 'is greater than operator value', isMatch: true },
          { ruleValue: 150, inputValue: 100, explanation: 'is less than operator value', isMatch: false },
          { ruleValue: 150, inputValue: 150, explanation: 'is equal to operator value', isMatch: false },
        ],
      },
      {
        rule: 'NumericGreaterThanPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 200,
            comparisonValue: 150,
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 100,
            comparisonValue: 150,
            explanation: 'is less than operator value',
            isMatch: false,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 150,
            comparisonValue: 150,
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'NumericLessThanEquals',
        cases: [
          { ruleValue: 150, inputValue: 100, explanation: 'is less than operator value', isMatch: true },
          { ruleValue: 150, inputValue: 150, explanation: 'is equal to operator value', isMatch: true },
          { ruleValue: 150, inputValue: 200, explanation: 'is greater than operator value', isMatch: false },
        ],
      },
      {
        rule: 'NumericLessThanEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 100,
            comparisonValue: 150,
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 150,
            comparisonValue: 150,
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 200,
            comparisonValue: 150,
            explanation: 'is greater than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'NumericGreaterThanEquals',
        cases: [
          { ruleValue: 150, inputValue: 200, explanation: 'is greater than operator value', isMatch: true },
          { ruleValue: 150, inputValue: 150, explanation: 'is equal to operator value', isMatch: true },
          { ruleValue: 150, inputValue: 100, explanation: 'is less than operator value', isMatch: false },
        ],
      },
      {
        rule: 'NumericGreaterThanEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: 200,
            comparisonValue: 150,
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 150,
            comparisonValue: 150,
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: 100,
            comparisonValue: 150,
            explanation: 'is less than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'BooleanEquals',
        cases: [
          { ruleValue: true, inputValue: true, explanation: 'is equal to operator value', isMatch: true },
          { ruleValue: true, inputValue: false, explanation: 'is not equal to operator value', isMatch: false },
        ],
      },
      {
        rule: 'BooleanEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: true,
            comparisonValue: true,
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: false,
            comparisonValue: true,
            explanation: 'is not equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampEquals',
        cases: [
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-12-12T15:00:00Z',
            explanation: 'is not equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-01-01T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-12-12T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is not equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampLessThan',
        cases: [
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2019-12-31T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-12-12T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: false,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampLessThanPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2019-12-31T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-12-12T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: false,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-01-01T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampGreaterThan',
        cases: [
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-12-12T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2019-12-31T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: false,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampGreaterThanPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-12-12T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2019-12-31T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: false,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-01-01T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampLessThanEquals',
        cases: [
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2019-12-31T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-12-12T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampLessThanEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2019-12-31T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-01-01T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-12-12T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampGreaterThanEquals',
        cases: [
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-12-12T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '2020-01-01T15:00:00Z',
            inputValue: '2019-12-31T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'TimestampGreaterThanEqualsPath',
        cases: [
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-12-12T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is greater than operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2020-01-01T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is equal to operator value',
            isMatch: true,
          },
          {
            ruleValue: '$.comparisonValue',
            inputValue: '2019-12-31T15:00:00Z',
            comparisonValue: '2020-01-01T15:00:00Z',
            explanation: 'is less than operator value',
            isMatch: false,
          },
        ],
      },
      {
        rule: 'IsNull',
        cases: [
          { ruleValue: true, inputValue: null, explanation: 'is null', isMatch: true },
          { ruleValue: true, inputValue: 12345, explanation: 'is not null', isMatch: false },
        ],
      },
      {
        rule: 'IsPresent',
        cases: [
          { ruleValue: true, inputValue: 12345, explanation: 'exists', isMatch: true },
          { ruleValue: true, inputValue: undefined, explanation: 'does not exist', isMatch: false },
        ],
      },
      {
        rule: 'IsNumeric',
        cases: [
          { ruleValue: true, inputValue: 12345, explanation: 'is numeric', isMatch: true },
          { ruleValue: true, inputValue: '12345', explanation: 'is not numeric', isMatch: false },
        ],
      },
      {
        rule: 'IsString',
        cases: [
          { ruleValue: true, inputValue: '12345', explanation: 'is string', isMatch: true },
          { ruleValue: true, inputValue: 12345, explanation: 'is not string', isMatch: false },
        ],
      },
      {
        rule: 'IsBoolean',
        cases: [
          { ruleValue: true, inputValue: true, explanation: 'is true', isMatch: true },
          { ruleValue: true, inputValue: false, explanation: 'is false', isMatch: true },
          { ruleValue: true, inputValue: 12345, explanation: 'is not boolean', isMatch: false },
        ],
      },
      {
        rule: 'IsTimestamp',
        cases: [
          {
            ruleValue: true,
            inputValue: '2020-01-01T15:00:00Z',
            explanation: 'is timestamp',
            isMatch: true,
          },
          {
            ruleValue: true,
            inputValue: '2020-01-01T15:00:00+06:00',
            explanation: 'is timestamp with positive numeric timezone offset',
            isMatch: true,
          },
          {
            ruleValue: true,
            inputValue: '2020-01-01T15:00:00-06:00',
            explanation: 'is timestamp with negative numeric timezone offset',
            isMatch: true,
          },
          {
            ruleValue: true,
            inputValue: '2020-01-01 15:00:00Z',
            explanation: 'is timestamp but does not contain "T" character to separate date and time',
            isMatch: false,
          },
          {
            ruleValue: true,
            inputValue: '2020-01-01T15:00:00',
            explanation: 'is timestamp but does not contain "Z" character to denote absence of numeric timezone offset',
            isMatch: false,
          },
          {
            ruleValue: true,
            inputValue: 'not timestamp',
            explanation: 'is not timestamp',
            isMatch: false,
          },
        ],
      },
    ];

    describe.each(rules)('$rule', ({ rule, cases }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      describe.each(cases)('', ({ ruleValue, inputValue, comparisonValue, explanation, isMatch }) => {
        const choiceType = isMatch ? 'matching' : 'default';
        const testTitle = `should return ${choiceType} choice as next state if variable ${explanation}`;

        test(testTitle, async () => {
          const definition: ChoiceState = {
            Type: 'Choice',
            Choices: [
              {
                Variable: '$.test',
                [rule]: ruleValue,
                Next: 'MatchingChoice',
              },
            ],
            Default: 'DefaultChoice',
          };
          const input = { test: inputValue, comparisonValue };
          const context = {};

          const choiceStateHandler = new ChoiceStateHandler(definition);
          const { nextState } = await choiceStateHandler.executeState(input, context);

          if (isMatch) {
            expect(nextState).toBe('MatchingChoice');
          } else {
            expect(nextState).toBe('DefaultChoice');
          }
        });
      });
    });
  });

  test('should return state that matches choice rule as next state', async () => {
    const definition: ChoiceState = {
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
    };
    const input = { testNumberValue: 50, testStringValue: 'test', testBooleanValue: true };
    const context = {};

    const choiceStateHandler = new ChoiceStateHandler(definition);
    const { stateResult, nextState } = await choiceStateHandler.executeState(input, context);

    expect(stateResult).toEqual({ testNumberValue: 50, testStringValue: 'test', testBooleanValue: true });
    expect(nextState).toEqual('MatchingChoice');
  });

  test('should return state specified in `Default` as next state if none of the choices match', async () => {
    const definition: ChoiceState = {
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
    };
    const input = { testNumberValue: 50, testStringValue: 'test' };
    const context = {};

    const choiceStateHandler = new ChoiceStateHandler(definition);
    const { stateResult, nextState } = await choiceStateHandler.executeState(input, context);

    expect(stateResult).toEqual({ testNumberValue: 50, testStringValue: 'test' });
    expect(nextState).toEqual('DefaultChoice');
  });
});
