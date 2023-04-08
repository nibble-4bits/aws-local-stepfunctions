import type { JSONValue } from '../typings/JSONValue';
import type { Context } from '../typings/Context';
import { JSONPath as jp } from 'jsonpath-plus';

/**
 * Queries for a property in an object or in the context object of a state machine using a JSONPath expression.
 * @param pathExpression The JSONPath expression to query for.
 * @param json The object to evaluate (whether of null, boolean, number, string, object, or array type).
 * @param context The context object to evaluate, if the path expression starts with `$$`.
 * @returns The value of the property that was queried for, if found. Otherwise returns `undefined`.
 */
function jsonPathQuery<T>(pathExpression: string, json: JSONValue, context?: Context): T {
  // If the expression starts with double `$$`, evaluate the path in the context object.
  if (pathExpression.startsWith('$$')) {
    return jp({ path: pathExpression.slice(1), json: context ?? null, wrap: false });
  }

  return jp({ path: pathExpression, json, wrap: false });
}

export { jsonPathQuery };
