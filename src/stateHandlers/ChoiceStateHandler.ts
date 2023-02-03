import type { JSONValue } from '../typings/JSONValue';
import type { ChoiceState, ChoiceRuleWithoutNext } from '../typings/ChoiceState';
import { BaseStateHandler, ChoiceStateHandlerOptions, ExecutionResult } from './BaseStateHandler';
import { jsonPathQuery } from '../JsonPath';
import wcmatch from 'wildcard-match';

class ChoiceStateHandler extends BaseStateHandler<ChoiceState> {
  constructor(stateDefinition: ChoiceState) {
    super(stateDefinition);
  }

  testChoiceRule(choiceRule: ChoiceRuleWithoutNext, input: JSONValue): boolean {
    if ('And' in choiceRule) {
      return choiceRule.And!.every((rule) => this.testChoiceRule(rule, input));
    }

    if ('Or' in choiceRule) {
      return choiceRule.Or!.some((rule) => this.testChoiceRule(rule, input));
    }

    if ('Not' in choiceRule) {
      return !this.testChoiceRule(choiceRule.Not!, input);
    }

    if ('StringEquals' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      return varValue === choiceRule.StringEquals!;
    }

    if ('StringEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      const stringValue = jsonPathQuery(choiceRule.StringEqualsPath!, input) as string;
      return varValue === stringValue;
    }

    if ('StringLessThan' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      return varValue < choiceRule.StringLessThan!;
    }

    if ('StringLessThanPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      const stringValue = jsonPathQuery(choiceRule.StringLessThanPath!, input) as string;
      return varValue < stringValue;
    }

    if ('StringGreaterThan' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      return varValue > choiceRule.StringGreaterThan!;
    }

    if ('StringGreaterThanPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      const stringValue = jsonPathQuery(choiceRule.StringGreaterThanPath!, input) as string;
      return varValue > stringValue;
    }

    if ('StringLessThanEquals' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      return varValue <= choiceRule.StringLessThanEquals!;
    }

    if ('StringLessThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      const stringValue = jsonPathQuery(choiceRule.StringLessThanEqualsPath!, input) as string;
      return varValue <= stringValue;
    }

    if ('StringGreaterThanEquals' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      return varValue >= choiceRule.StringGreaterThanEquals!;
    }

    if ('StringGreaterThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      const stringValue = jsonPathQuery(choiceRule.StringGreaterThanEqualsPath!, input) as string;
      return varValue >= stringValue;
    }

    if ('StringMatches' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      const isMatch = wcmatch(choiceRule.StringMatches!, { separator: false });
      return isMatch(varValue);
    }

    if ('NumericEquals' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      return varValue === choiceRule.NumericEquals!;
    }

    if ('NumericEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      const numberValue = jsonPathQuery(choiceRule.NumericEqualsPath!, input) as number;
      return varValue === numberValue;
    }

    if ('NumericLessThan' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      return varValue < choiceRule.NumericLessThan!;
    }

    if ('NumericLessThanPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      const numberValue = jsonPathQuery(choiceRule.NumericLessThanPath!, input) as number;
      return varValue < numberValue;
    }

    if ('NumericGreaterThan' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      return varValue > choiceRule.NumericGreaterThan!;
    }

    if ('NumericGreaterThanPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      const numberValue = jsonPathQuery(choiceRule.NumericGreaterThanPath!, input) as number;
      return varValue > numberValue;
    }

    if ('NumericLessThanEquals' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      return varValue <= choiceRule.NumericLessThanEquals!;
    }

    if ('NumericLessThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      const numberValue = jsonPathQuery(choiceRule.NumericLessThanEqualsPath!, input) as number;
      return varValue <= numberValue;
    }

    if ('NumericGreaterThanEquals' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      return varValue >= choiceRule.NumericGreaterThanEquals!;
    }

    if ('NumericGreaterThanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as number;
      const numberValue = jsonPathQuery(choiceRule.NumericGreaterThanEqualsPath!, input) as number;
      return varValue >= numberValue;
    }

    if ('BooleanEquals' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as boolean;
      return varValue === choiceRule.BooleanEquals!;
    }

    if ('BooleanEqualsPath' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as boolean;
      const booleanValue = jsonPathQuery(choiceRule.BooleanEqualsPath!, input) as boolean;
      return varValue === booleanValue;
    }

    if ('TimestampEquals' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(choiceRule.TimestampEquals!);
      return varValue.getTime() === timestampValue.getTime();
    }

    if ('TimestampEqualsPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(jsonPathQuery(choiceRule.TimestampEqualsPath!, input) as string);
      return varValue.getTime() === timestampValue.getTime();
    }

    if ('TimestampLessThan' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(choiceRule.TimestampLessThan!);
      return varValue < timestampValue;
    }

    if ('TimestampLessThanPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(jsonPathQuery(choiceRule.TimestampLessThanPath!, input) as string);
      return varValue < timestampValue;
    }

    if ('TimestampGreaterThan' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(choiceRule.TimestampGreaterThan!);
      return varValue > timestampValue;
    }

    if ('TimestampGreaterThanPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(jsonPathQuery(choiceRule.TimestampGreaterThanPath!, input) as string);
      return varValue > timestampValue;
    }

    if ('TimestampLessThanEquals' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(choiceRule.TimestampLessThanEquals!);
      return varValue <= timestampValue;
    }

    if ('TimestampLessThanEqualsPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(jsonPathQuery(choiceRule.TimestampLessThanEqualsPath!, input) as string);
      return varValue <= timestampValue;
    }

    if ('TimestampGreaterThanEquals' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(choiceRule.TimestampGreaterThanEquals!);
      return varValue >= timestampValue;
    }

    if ('TimestampGreaterThanEqualsPath' in choiceRule) {
      const varValue = new Date(jsonPathQuery(choiceRule.Variable, input) as string);
      const timestampValue = new Date(jsonPathQuery(choiceRule.TimestampGreaterThanEqualsPath!, input) as string);
      return varValue >= timestampValue;
    }

    if ('IsNull' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input);
      const isNullTrue = choiceRule.IsNull!;
      return isNullTrue && varValue === null;
    }

    if ('IsPresent' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input);
      const IsPresentTrue = choiceRule.IsPresent!;
      return IsPresentTrue && !!varValue;
    }

    if ('IsNumeric' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input);
      const IsNumericTrue = choiceRule.IsNumeric!;
      return IsNumericTrue && typeof varValue === 'number';
    }

    if ('IsString' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input);
      const IsStringTrue = choiceRule.IsString!;
      return IsStringTrue && typeof varValue === 'string';
    }

    if ('IsBoolean' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input);
      const IsBooleanTrue = choiceRule.IsBoolean!;
      return IsBooleanTrue && typeof varValue === 'boolean';
    }

    if ('IsTimestamp' in choiceRule) {
      const varValue = jsonPathQuery(choiceRule.Variable, input) as string;
      const IsTimestampTrue = choiceRule.IsTimestamp!;
      return IsTimestampTrue && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|(\+|-)\d{2}:\d{2})/.test(varValue);
    }

    return false;
  }

  override async executeState(
    input: JSONValue,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: Record<string, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: ChoiceStateHandlerOptions
  ): Promise<ExecutionResult> {
    const state = this.stateDefinition;

    for (const choice of state.Choices) {
      const choiceIsMatch = this.testChoiceRule(choice, input);
      if (choiceIsMatch) {
        return { stateResult: input, nextState: choice.Next };
      }
    }

    if (state.Default) {
      return { stateResult: input, nextState: state.Default };
    }

    // TODO: Throw States.NoChoiceMatched error here because all choices failed to match and no `Default` field was specified.
    throw new Error('States.NoChoiceMatched');
  }
}

export { ChoiceStateHandler };
