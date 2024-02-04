import type { JSONValue } from '../../typings/JSONValue';
import type { ChoiceState, ChoiceRuleWithoutNext } from '../../typings/ChoiceState';
import type { ChoiceStateActionOptions, ActionResult } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import { BaseStateAction } from './BaseStateAction';
import { jsonPathQuery } from '../jsonPath/JsonPath';
import { StatesNoChoiceMatchedError } from '../../error/predefined/StatesNoChoiceMatchedError';
import { isRFC3339Timestamp } from '../../util';
import { StringConstraint } from '../jsonPath/constraints/StringConstraint';
import { NumberConstraint } from '../jsonPath/constraints/NumberConstraint';
import { BooleanConstraint } from '../jsonPath/constraints/BooleanConstraint';
import { RFC3339TimestampConstraint } from '../jsonPath/constraints/RFC3339TimestampConstraint';
// @ts-expect-error See: https://github.com/axtgr/wildcard-match/issues/12
// package.json of wildcard-match module needs a "types" field inside "exports", because we're using "bundler" module resolution
import wcmatch from 'wildcard-match';

class ChoiceStateAction extends BaseStateAction<ChoiceState> {
  constructor(stateDefinition: ChoiceState, stateName: string) {
    super(stateDefinition, stateName);
  }

  testChoiceRule(choiceRule: ChoiceRuleWithoutNext, input: JSONValue, context: Context): boolean {
    if ('And' in choiceRule) {
      return choiceRule.And.every((rule) => this.testChoiceRule(rule, input, context));
    }

    if ('Or' in choiceRule) {
      return choiceRule.Or.some((rule) => this.testChoiceRule(rule, input, context));
    }

    if ('Not' in choiceRule) {
      return !this.testChoiceRule(choiceRule.Not, input, context);
    }

    if ('StringEquals' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      return varValue === choiceRule.StringEquals;
    }

    if ('StringEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      const stringValue = jsonPathQuery<string>(choiceRule.StringEqualsPath, input, context, {
        constraints: [StringConstraint],
      });
      return varValue === stringValue;
    }

    if ('StringLessThan' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      return varValue < choiceRule.StringLessThan;
    }

    if ('StringLessThanPath' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      const stringValue = jsonPathQuery<string>(choiceRule.StringLessThanPath, input, context, {
        constraints: [StringConstraint],
      });
      return varValue < stringValue;
    }

    if ('StringGreaterThan' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      return varValue > choiceRule.StringGreaterThan;
    }

    if ('StringGreaterThanPath' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      const stringValue = jsonPathQuery<string>(choiceRule.StringGreaterThanPath, input, context, {
        constraints: [StringConstraint],
      });
      return varValue > stringValue;
    }

    if ('StringLessThanEquals' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      return varValue <= choiceRule.StringLessThanEquals;
    }

    if ('StringLessThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      const stringValue = jsonPathQuery<string>(choiceRule.StringLessThanEqualsPath, input, context, {
        constraints: [StringConstraint],
      });
      return varValue <= stringValue;
    }

    if ('StringGreaterThanEquals' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      return varValue >= choiceRule.StringGreaterThanEquals;
    }

    if ('StringGreaterThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      const stringValue = jsonPathQuery<string>(choiceRule.StringGreaterThanEqualsPath, input, context, {
        constraints: [StringConstraint],
      });
      return varValue >= stringValue;
    }

    if ('StringMatches' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      const isMatch = wcmatch(choiceRule.StringMatches, { separator: false });
      return isMatch(varValue);
    }

    if ('NumericEquals' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      return varValue === choiceRule.NumericEquals;
    }

    if ('NumericEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      const numberValue = jsonPathQuery<number>(choiceRule.NumericEqualsPath, input, context, {
        constraints: [NumberConstraint],
      });
      return varValue === numberValue;
    }

    if ('NumericLessThan' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      return varValue < choiceRule.NumericLessThan;
    }

    if ('NumericLessThanPath' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      const numberValue = jsonPathQuery<number>(choiceRule.NumericLessThanPath, input, context, {
        constraints: [NumberConstraint],
      });
      return varValue < numberValue;
    }

    if ('NumericGreaterThan' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      return varValue > choiceRule.NumericGreaterThan;
    }

    if ('NumericGreaterThanPath' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      const numberValue = jsonPathQuery<number>(choiceRule.NumericGreaterThanPath, input, context, {
        constraints: [NumberConstraint],
      });
      return varValue > numberValue;
    }

    if ('NumericLessThanEquals' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      return varValue <= choiceRule.NumericLessThanEquals;
    }

    if ('NumericLessThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      const numberValue = jsonPathQuery<number>(choiceRule.NumericLessThanEqualsPath, input, context, {
        constraints: [NumberConstraint],
      });
      return varValue <= numberValue;
    }

    if ('NumericGreaterThanEquals' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      return varValue >= choiceRule.NumericGreaterThanEquals;
    }

    if ('NumericGreaterThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery<number>(choiceRule.Variable, input, context);
      const numberValue = jsonPathQuery<number>(choiceRule.NumericGreaterThanEqualsPath, input, context, {
        constraints: [NumberConstraint],
      });
      return varValue >= numberValue;
    }

    if ('BooleanEquals' in choiceRule) {
      const varValue = jsonPathQuery<boolean>(choiceRule.Variable, input, context);
      return varValue === choiceRule.BooleanEquals;
    }

    if ('BooleanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery<boolean>(choiceRule.Variable, input, context);
      const booleanValue = jsonPathQuery<boolean>(choiceRule.BooleanEqualsPath, input, context, {
        constraints: [BooleanConstraint],
      });
      return varValue === booleanValue;
    }

    if ('TimestampEquals' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(choiceRule.TimestampEquals);
      return varValue.getTime() === timestampValue.getTime();
    }

    if ('TimestampEqualsPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(
        jsonPathQuery<string>(choiceRule.TimestampEqualsPath, input, context, {
          constraints: [RFC3339TimestampConstraint],
        })
      );
      return varValue.getTime() === timestampValue.getTime();
    }

    if ('TimestampLessThan' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(choiceRule.TimestampLessThan);
      return varValue < timestampValue;
    }

    if ('TimestampLessThanPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(
        jsonPathQuery<string>(choiceRule.TimestampLessThanPath, input, context, {
          constraints: [RFC3339TimestampConstraint],
        })
      );
      return varValue < timestampValue;
    }

    if ('TimestampGreaterThan' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(choiceRule.TimestampGreaterThan);
      return varValue > timestampValue;
    }

    if ('TimestampGreaterThanPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(
        jsonPathQuery<string>(choiceRule.TimestampGreaterThanPath, input, context, {
          constraints: [RFC3339TimestampConstraint],
        })
      );
      return varValue > timestampValue;
    }

    if ('TimestampLessThanEquals' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(choiceRule.TimestampLessThanEquals);
      return varValue <= timestampValue;
    }

    if ('TimestampLessThanEqualsPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(
        jsonPathQuery<string>(choiceRule.TimestampLessThanEqualsPath, input, context, {
          constraints: [RFC3339TimestampConstraint],
        })
      );
      return varValue <= timestampValue;
    }

    if ('TimestampGreaterThanEquals' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(choiceRule.TimestampGreaterThanEquals);
      return varValue >= timestampValue;
    }

    if ('TimestampGreaterThanEqualsPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery<string>(choiceRule.Variable, input, context));
      const timestampValue = new Date(
        jsonPathQuery<string>(choiceRule.TimestampGreaterThanEqualsPath, input, context, {
          constraints: [RFC3339TimestampConstraint],
        })
      );
      return varValue >= timestampValue;
    }

    if ('IsNull' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input, context);
      const isNullTrue = choiceRule.IsNull;
      return isNullTrue && varValue === null;
    }

    if ('IsPresent' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input, context, { ignoreDefinedValueConstraint: true });
      const IsPresentTrue = choiceRule.IsPresent;
      return IsPresentTrue && varValue !== undefined;
    }

    if ('IsNumeric' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input, context);
      const IsNumericTrue = choiceRule.IsNumeric;
      return IsNumericTrue && typeof varValue === 'number';
    }

    if ('IsString' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input, context);
      const IsStringTrue = choiceRule.IsString;
      return IsStringTrue && typeof varValue === 'string';
    }

    if ('IsBoolean' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input, context);
      const IsBooleanTrue = choiceRule.IsBoolean;
      return IsBooleanTrue && typeof varValue === 'boolean';
    }

    if ('IsTimestamp' in choiceRule) {
      const varValue = jsonPathQuery<string>(choiceRule.Variable, input, context);
      const IsTimestampTrue = choiceRule.IsTimestamp;
      return IsTimestampTrue && isRFC3339Timestamp(varValue);
    }

    return false;
  }

  override async execute(
    input: JSONValue,
    context: Context,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: ChoiceStateActionOptions
  ): Promise<ActionResult> {
    const state = this.stateDefinition;

    for (const choice of state.Choices) {
      const choiceIsMatch = this.testChoiceRule(choice, input, context);
      if (choiceIsMatch) {
        return { stateResult: input, nextState: choice.Next, isEndState: false };
      }
    }

    if (state.Default) {
      return { stateResult: input, nextState: state.Default, isEndState: false };
    }

    throw new StatesNoChoiceMatchedError();
  }
}

export { ChoiceStateAction };
