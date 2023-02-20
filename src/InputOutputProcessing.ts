import type { PayloadTemplate } from './typings/InputOutputProcessing';
import type { JSONValue } from './typings/JSONValue';
import { isPlainObj } from './util';
import { jsonPathQuery } from './JsonPath';
import cloneDeep from 'lodash/cloneDeep.js';
import set from 'lodash/set.js';

/**
 * Process the current input according to the path defined in the `InputPath` field, if specified in the current state.
 * @returns
 * * If `InputPath` is not specified, returns the current input unmodified.
 * * If `InputPath` is `null`, returns an empty object (`{}`).
 * * If `InputPath` is a string, it's considered a JSONPath and the selected portion of the current input is returned.
 */
function processInputPath(path: string | null | undefined, input: JSONValue, context?: JSONValue): JSONValue {
  if (path === undefined) {
    return input;
  }

  if (path === null) {
    return {};
  }

  return jsonPathQuery(path, input, context);
}

/**
 * Recursively process a payload template to resolve the properties that are JSONPaths.
 * @param payloadTemplate The payload template to process.
 * @param json The object to evaluate with JSONPath (whether of null, boolean, number, string, object, or array type).
 * @param context The context object to evaluate, if the path expression starts with `$$`.
 * @returns The processed payload template.
 */
function processPayloadTemplate(
  payloadTemplate: PayloadTemplate,
  json: JSONValue,
  context?: JSONValue
): PayloadTemplate {
  const resolvedProperties = Object.entries(payloadTemplate).map(([key, value]) => {
    let sanitizedKey = key;
    let resolvedValue = value;

    // Recursively process child object
    if (isPlainObj(value)) {
      resolvedValue = processPayloadTemplate(value, json);
    }

    // Only resolve value if key ends with `.$` and value is a string
    if (key.endsWith('.$') && typeof value === 'string') {
      sanitizedKey = key.replace('.$', '');
      resolvedValue = jsonPathQuery(value, json, context);
    }

    return [sanitizedKey, resolvedValue];
  });

  return Object.fromEntries(resolvedProperties);
}

/**
 * Process the current result according to the path defined in the `ResultPath` field, if specified in the current state.
 * @returns
 * * If `ResultPath` is not specified, returns the current result unmodified.
 * * If `ResultPath` is `null`, returns the raw input (i.e. the input passed to current state).
 * * If `ResultPath` is a string, it's considered a JSONPath and returns a combination of the raw input with the current result,
 * by placing the current result in the specified path.
 */
function processResultPath(path: string | null | undefined, rawInput: JSONValue, result: JSONValue): JSONValue {
  if (path === undefined) {
    return result;
  }

  if (path === null) {
    return rawInput;
  }

  const sanitizedPath = path.replace('$.', '');

  if (isPlainObj(rawInput)) {
    const clonedRawInput = cloneDeep(rawInput) as object;
    return set(clonedRawInput, sanitizedPath, result);
  } else {
    throw new Error('TODO: Change this error message for a more descriptive one');
  }
}

/**
 * Process the current result according to the path defined in the `OutputPath` field, if specified in the current state.
 * @returns
 * * If `OutputPath` is not specified, returns the current result unmodified.
 * * If `OutputPath` is `null`, returns an empty object (`{}`).
 * * If `OutputPath` is a string, it's considered a JSONPath and the selected portion of the current result is returned.
 */
function processOutputPath(path: string | null | undefined, result: JSONValue, context?: JSONValue): JSONValue {
  if (path === undefined) {
    return result;
  }

  if (path === null) {
    return {};
  }

  return jsonPathQuery(path, result, context);
}

export { processInputPath, processPayloadTemplate, processResultPath, processOutputPath };
