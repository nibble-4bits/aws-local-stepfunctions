import type { ChoiceRuleWithoutNext } from './typings/ChoiceState';
import type { JSONValue } from './typings/JSONValue';
import wcmatch from 'wildcard-match';

export function testChoiceRule(
  choiceRule: ChoiceRuleWithoutNext,
  currInput: JSONValue,
  jsonQuery: (pathExpression: string, json: JSONValue) => unknown
): boolean {
  if ('And' in choiceRule) {
    return choiceRule.And!.every((rule) => testChoiceRule(rule, currInput, jsonQuery));
  }

  if ('Or' in choiceRule) {
    return choiceRule.Or!.some((rule) => testChoiceRule(rule, currInput, jsonQuery));
  }

  if ('Not' in choiceRule) {
    return !testChoiceRule(choiceRule.Not!, currInput, jsonQuery);
  }

  if ('StringEquals' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    return varValue === choiceRule.StringEquals!;
  }

  if ('StringEqualsPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    const stringValue = jsonQuery(choiceRule.StringEqualsPath!, currInput) as string;
    return varValue === stringValue;
  }

  if ('StringLessThan' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    return varValue < choiceRule.StringLessThan!;
  }

  if ('StringLessThanPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    const stringValue = jsonQuery(choiceRule.StringLessThanPath!, currInput) as string;
    return varValue < stringValue;
  }

  if ('StringGreaterThan' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    return varValue > choiceRule.StringGreaterThan!;
  }

  if ('StringGreaterThanPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    const stringValue = jsonQuery(choiceRule.StringGreaterThanPath!, currInput) as string;
    return varValue > stringValue;
  }

  if ('StringLessThanEquals' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    return varValue <= choiceRule.StringLessThanEquals!;
  }

  if ('StringLessThanEqualsPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    const stringValue = jsonQuery(choiceRule.StringLessThanEqualsPath!, currInput) as string;
    return varValue <= stringValue;
  }

  if ('StringGreaterThanEquals' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    return varValue >= choiceRule.StringGreaterThanEquals!;
  }

  if ('StringGreaterThanEqualsPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    const stringValue = jsonQuery(choiceRule.StringGreaterThanEqualsPath!, currInput) as string;
    return varValue >= stringValue;
  }

  if ('StringMatches' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    const isMatch = wcmatch(choiceRule.StringMatches!, { separator: false });
    return isMatch(varValue);
  }

  if ('NumericEquals' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    return varValue === choiceRule.NumericEquals!;
  }

  if ('NumericEqualsPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    const numberValue = jsonQuery(choiceRule.NumericEqualsPath!, currInput) as number;
    return varValue === numberValue;
  }

  if ('NumericLessThan' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    return varValue < choiceRule.NumericLessThan!;
  }

  if ('NumericLessThanPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    const numberValue = jsonQuery(choiceRule.NumericLessThanPath!, currInput) as number;
    return varValue < numberValue;
  }

  if ('NumericGreaterThan' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    return varValue > choiceRule.NumericGreaterThan!;
  }

  if ('NumericGreaterThanPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    const numberValue = jsonQuery(choiceRule.NumericGreaterThanPath!, currInput) as number;
    return varValue > numberValue;
  }

  if ('NumericLessThanEquals' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    return varValue <= choiceRule.NumericLessThanEquals!;
  }

  if ('NumericLessThanEqualsPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    const numberValue = jsonQuery(choiceRule.NumericLessThanEqualsPath!, currInput) as number;
    return varValue <= numberValue;
  }

  if ('NumericGreaterThanEquals' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    return varValue >= choiceRule.NumericGreaterThanEquals!;
  }

  if ('NumericGreaterThanEqualsPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as number;
    const numberValue = jsonQuery(choiceRule.NumericGreaterThanEqualsPath!, currInput) as number;
    return varValue >= numberValue;
  }

  if ('BooleanEquals' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as boolean;
    return varValue === choiceRule.BooleanEquals!;
  }

  if ('BooleanEqualsPath' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as boolean;
    const booleanValue = jsonQuery(choiceRule.BooleanEqualsPath!, currInput) as boolean;
    return varValue === booleanValue;
  }

  if ('TimestampEquals' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(choiceRule.TimestampEquals!);
    return varValue.getTime() === timestampValue.getTime();
  }

  if ('TimestampEqualsPath' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(jsonQuery(choiceRule.TimestampEqualsPath!, currInput) as string);
    return varValue.getTime() === timestampValue.getTime();
  }

  if ('TimestampLessThan' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(choiceRule.TimestampLessThan!);
    return varValue < timestampValue;
  }

  if ('TimestampLessThanPath' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(jsonQuery(choiceRule.TimestampLessThanPath!, currInput) as string);
    return varValue < timestampValue;
  }

  if ('TimestampGreaterThan' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(choiceRule.TimestampGreaterThan!);
    return varValue > timestampValue;
  }

  if ('TimestampGreaterThanPath' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(jsonQuery(choiceRule.TimestampGreaterThanPath!, currInput) as string);
    return varValue > timestampValue;
  }

  if ('TimestampLessThanEquals' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(choiceRule.TimestampLessThanEquals!);
    return varValue <= timestampValue;
  }

  if ('TimestampLessThanEqualsPath' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(jsonQuery(choiceRule.TimestampLessThanEqualsPath!, currInput) as string);
    return varValue <= timestampValue;
  }

  if ('TimestampGreaterThanEquals' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(choiceRule.TimestampGreaterThanEquals!);
    return varValue >= timestampValue;
  }

  if ('TimestampGreaterThanEqualsPath' in choiceRule) {
    const varValue = new Date(jsonQuery(choiceRule.Variable, currInput) as string);
    const timestampValue = new Date(jsonQuery(choiceRule.TimestampGreaterThanEqualsPath!, currInput) as string);
    return varValue >= timestampValue;
  }

  if ('IsNull' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput);
    const isNullTrue = choiceRule.IsNull!;
    return isNullTrue && varValue === null;
  }

  if ('IsPresent' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput);
    const IsPresentTrue = choiceRule.IsPresent!;
    return IsPresentTrue && !!varValue;
  }

  if ('IsNumeric' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput);
    const IsNumericTrue = choiceRule.IsNumeric!;
    return IsNumericTrue && typeof varValue === 'number';
  }

  if ('IsString' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput);
    const IsStringTrue = choiceRule.IsString!;
    return IsStringTrue && typeof varValue === 'string';
  }

  if ('IsBoolean' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput);
    const IsBooleanTrue = choiceRule.IsBoolean!;
    return IsBooleanTrue && typeof varValue === 'boolean';
  }

  if ('IsTimestamp' in choiceRule) {
    const varValue = jsonQuery(choiceRule.Variable, currInput) as string;
    const IsTimestampTrue = choiceRule.IsTimestamp!;
    return IsTimestampTrue && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/.test(varValue);
  }

  return false;
}
