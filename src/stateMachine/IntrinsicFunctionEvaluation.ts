import type { Context } from '../typings/Context';
import type { BaseIntrinsicFunction } from './intrinsicFunctions/BaseIntrinsicFunction';
import type { IntrinsicFunctionName } from '../typings/IntrinsicFunctions';
import type { JSONValue } from '../typings/JSONValue';
import { StatesFormat } from './intrinsicFunctions/StatesFormat';
import { StatesStringToJson } from './intrinsicFunctions/StatesStringToJson';
import { StatesJsonToString } from './intrinsicFunctions/StatesJsonToString';
import { StatesArray } from './intrinsicFunctions/StatesArray';
import { StatesArrayPartition } from './intrinsicFunctions/StatesArrayPartition';
import { StatesArrayContains } from './intrinsicFunctions/StatesArrayContains';
import { StatesArrayRange } from './intrinsicFunctions/StatesArrayRange';
import { StatesArrayGetItem } from './intrinsicFunctions/StatesArrayGetItem';
import { StatesArrayLength } from './intrinsicFunctions/StatesArrayLength';
import { StatesArrayUnique } from './intrinsicFunctions/StatesArrayUnique';
import { StatesBase64Encode } from './intrinsicFunctions/StatesBase64Encode';
import { StatesBase64Decode } from './intrinsicFunctions/StatesBase64Decode';
import { StatesHash } from './intrinsicFunctions/StatesHash';
import { StatesJsonMerge } from './intrinsicFunctions/StatesJsonMerge';
import { StatesMathRandom } from './intrinsicFunctions/StatesMathRandom';
import { StatesMathAdd } from './intrinsicFunctions/StatesMathAdd';
import { StatesStringSplit } from './intrinsicFunctions/StatesStringSplit';
import { StatesUUID } from './intrinsicFunctions/StatesUUID';

const functions: Record<IntrinsicFunctionName, BaseIntrinsicFunction> = {
  'States.Format': new StatesFormat(),
  'States.StringToJson': new StatesStringToJson(),
  'States.JsonToString': new StatesJsonToString(),
  'States.Array': new StatesArray(),
  'States.ArrayPartition': new StatesArrayPartition(),
  'States.ArrayContains': new StatesArrayContains(),
  'States.ArrayRange': new StatesArrayRange(),
  'States.ArrayGetItem': new StatesArrayGetItem(),
  'States.ArrayLength': new StatesArrayLength(),
  'States.ArrayUnique': new StatesArrayUnique(),
  'States.Base64Encode': new StatesBase64Encode(),
  'States.Base64Decode': new StatesBase64Decode(),
  'States.Hash': new StatesHash(),
  'States.JsonMerge': new StatesJsonMerge(),
  'States.MathRandom': new StatesMathRandom(),
  'States.MathAdd': new StatesMathAdd(),
  'States.StringSplit': new StatesStringSplit(),
  'States.UUID': new StatesUUID(),
};

/**
 * Evaluate an intrinsic function. Any nested (however deeply) intrinsic functions also get evaluated.
 * @returns The result of the intrinsic function evaluation.
 */
export function evaluateIntrinsicFunction(intrinsicFunction: string, input: JSONValue, context?: Context): JSONValue {
  const openingParensIdx = intrinsicFunction.indexOf('(');
  const funcName = intrinsicFunction.slice(0, openingParensIdx) as IntrinsicFunctionName;
  const funcArgs = intrinsicFunction.slice(openingParensIdx + 1, intrinsicFunction.length - 1);

  const splitArgs = [];
  let partialArg = '';
  let parensCount = 0;
  let apostropheCount = 0;
  for (let i = 0; i < funcArgs.length; i++) {
    const char = funcArgs[i];

    // If opening parens is found, extract arguments of intrinsic function until a closing parens is found
    // This prevents commas inside argument list from being interpreted as a split char
    if (char === '(') {
      parensCount++;
    } else if (char === ')') {
      parensCount--;
    }

    // If an apostrophe is found, extract string contents until closing apostrophe is found
    // This prevents commas inside string from being interpreted as a split char
    if (char === "'" && partialArg[partialArg.length - 1] !== '\\') {
      if (apostropheCount === 1) {
        apostropheCount--;
      } else {
        apostropheCount++;
      }
    }

    // If a comma is found and we're not inside a nested function or string, or if this is the last argument,
    // push the current partial argument to the `splitArgs` array
    if ((char === ',' && parensCount === 0 && apostropheCount === 0) || i === funcArgs.length - 1) {
      if (i === funcArgs.length - 1) partialArg += char;

      partialArg = partialArg.trim();
      if (partialArg.startsWith('States')) {
        // If argument starts with `States`, recursively evaluate the nested function
        const evaluatedNestedFunction = evaluateIntrinsicFunction(partialArg, input, context);
        splitArgs.push(JSON.stringify(evaluatedNestedFunction));
      } else {
        splitArgs.push(partialArg);
      }
      partialArg = '';
    } else {
      partialArg += char;
    }
  }

  return functions[funcName].call(input, context, ...splitArgs);
}
