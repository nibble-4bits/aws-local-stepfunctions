import type { BaseJSONPathConstraint } from './constraints/BaseJsonPathConstraint';
import type { JSONValue } from '../../typings/JSONValue';
import type { Context } from '../../typings/Context';
import { JSONPath as jp } from 'jsonpath-plus';
import { DefinedValueConstraint } from './constraints/DefinedValueConstraint';

/**
 * Queries for a property in an object or in the context object of a state machine using a JSONPath expression.
 * @param pathExpression The JSONPath expression to query for.
 * @param json The object to evaluate (whether of null, boolean, number, string, object, or array type).
 * @param context The context object to evaluate, if the path expression starts with `$$`.
 * @param constraints Optional array of constraints that check if the result of the evaluation fulfills the restrictions set by the constraints.
 * @returns The value of the property that was queried for, if found. Otherwise returns `undefined`.
 */
function jsonPathQuery<T>(
  pathExpression: string,
  json: JSONValue,
  context: Context,
  constraints: (new (...params: ConstructorParameters<typeof BaseJSONPathConstraint>) => BaseJSONPathConstraint)[] = []
): T {
  // All JSONPaths must point to a defined value
  const defaultConstraints = [DefinedValueConstraint];
  let evaluation: T;

  // If the expression starts with double `$$`, evaluate the path in the context object.
  if (pathExpression.startsWith('$$')) {
    evaluation = jp({ path: pathExpression.slice(1), json: context ?? null, wrap: false });
  } else {
    evaluation = jp({ path: pathExpression, json, wrap: false });
  }

  for (const Constraint of [...defaultConstraints, ...constraints]) {
    const constraintObject = new Constraint(pathExpression);
    constraintObject.test(evaluation);
  }

  return evaluation;
}

export { jsonPathQuery };
