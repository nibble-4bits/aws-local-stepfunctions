import type {
  ArgumentType,
  ArgumentConstraint,
  IntrinsicFunctionDefinition,
} from '../../typings/IntrinsicFunctionsImplementation';
import type { Context } from '../../typings/Context';
import type { JSONValue } from '../../typings/JSONValue';
import { jsonPathQuery } from '../JsonPath';
import { isPlainObj } from '../../util';

function validateArgumentType(allowedTypes: ArgumentType[], argPosition: number, funcArg: JSONValue, funcName: string) {
  let matchesAllowedType = false;
  for (const argType of allowedTypes) {
    switch (argType) {
      case 'string':
      case 'number':
      case 'boolean':
        matchesAllowedType = typeof funcArg === argType;
        break;
      case 'null':
        matchesAllowedType = funcArg === null;
        break;
      case 'array':
        matchesAllowedType = Array.isArray(funcArg);
        break;
      case 'object':
        matchesAllowedType = isPlainObj(funcArg);
        break;
      case 'any':
        matchesAllowedType = true;
        break;
    }

    if (matchesAllowedType) break;
  }

  const expectedType = allowedTypes.map((type) => `"${type}"`).join(' | ');
  if (!matchesAllowedType) {
    throw new Error(
      `Intrinsic function ${funcName} expected argument ${argPosition} to be of type ${expectedType}, but received ${typeof funcArg}`
    );
  }
}

function validateArgumentConstraints(
  argConstraints: ArgumentConstraint[] | undefined,
  argPosition: number,
  funcArg: JSONValue,
  funcName: string
) {
  if (argConstraints) {
    let matchesAllConstraints = false;
    for (const constraint of argConstraints) {
      switch (constraint) {
        case 'ZERO':
          matchesAllConstraints = funcArg !== 0;
          break;
        case 'POSITIVE_INTEGER':
          matchesAllConstraints = Number.isInteger(funcArg) && (funcArg as number) > 0;
          break;
        case 'NEGATIVE_INTEGER':
          matchesAllConstraints = Number.isInteger(funcArg) && (funcArg as number) < 0;
          break;
        case 'INTEGER':
          matchesAllConstraints = Number.isInteger(funcArg);
          break;
      }

      if (matchesAllConstraints) break;
    }

    const expectedConstraints = argConstraints.map((constraint) => `"${constraint}"`).join(' | ');
    if (!matchesAllConstraints) {
      throw new Error(
        `Intrinsic function ${funcName} expected argument ${argPosition} to satisfy the following constraints: ${expectedConstraints}`
      );
    }
  }
}

function validateArguments(funcDefinition: IntrinsicFunctionDefinition, ...args: JSONValue[]): void {
  // Validate if number of arguments provided is different from the exact number required
  if ('exactArgs' in funcDefinition && args.length !== funcDefinition.exactArgs) {
    throw new Error(
      `Intrinsic function ${funcDefinition.name} expects exactly ${funcDefinition.exactArgs} arguments, but received ${args.length}`
    );
  }

  // Validate if number of arguments provided is less than the minimum required
  if ('minArgs' in funcDefinition && args.length < funcDefinition.minArgs) {
    throw new Error(
      `Intrinsic function ${funcDefinition.name} expects at least ${funcDefinition.minArgs} arguments, but received ${args.length}`
    );
  }

  // Validate if number of arguments provided is more than the maximum required
  if ('maxArgs' in funcDefinition && args.length > funcDefinition.maxArgs) {
    throw new Error(
      `Intrinsic function ${funcDefinition.name} expects at most ${funcDefinition.maxArgs} arguments, but received ${args.length}`
    );
  }

  // Validate arguments definition
  if ('arguments' in funcDefinition) {
    for (let i = 0; i < funcDefinition.arguments.length; i++) {
      const argDefinition = funcDefinition.arguments[i];
      const funcArg = args[i];

      // If argument is undefined, optional argument wasn't passed, so break out of loop
      if (funcArg === undefined) break;

      validateArgumentType(argDefinition.allowedTypes, i + 1, funcArg, funcDefinition.name);
      validateArgumentConstraints(argDefinition.constraints, i + 1, funcArg, funcDefinition.name);
    }
  }

  // Validate variadic arguments definition
  if ('variadicArguments' in funcDefinition) {
    const argDefinition = funcDefinition.variadicArguments;
    for (let i = funcDefinition.arguments?.length ?? 0; i < args.length; i++) {
      const funcArg = args[i];

      validateArgumentType(argDefinition.allowedTypes, i + 1, funcArg, funcDefinition.name);
      validateArgumentConstraints(argDefinition.constraints, i + 1, funcArg, funcDefinition.name);
    }
  }
}

function parseArguments(input: JSONValue, context?: Context, ...args: string[]): JSONValue[] {
  return args.map<JSONValue>((arg) => {
    if (arg[0] === "'") {
      const lastSingleQuote = arg.lastIndexOf("'");
      return arg.slice(1, lastSingleQuote);
    }

    if (arg[0] === '$') {
      return jsonPathQuery(arg, input, context);
    }

    return JSON.parse(arg);
  });
}

export { validateArguments, parseArguments };
