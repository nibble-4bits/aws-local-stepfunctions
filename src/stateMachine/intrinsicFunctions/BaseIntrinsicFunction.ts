import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import type { Context } from '../../typings/Context';
import { jsonPathQuery } from '../JsonPath';
import { isPlainObj } from '../../util';

abstract class BaseIntrinsicFunction {
  protected abstract readonly funcDefinition: IntrinsicFunctionDefinition;

  protected abstract execute(...args: JSONValue[]): JSONValue;

  private validateArguments(...args: JSONValue[]): void {
    // Validate if number of arguments provided is different from the exact number required
    if ('exactArgs' in this.funcDefinition && args.length !== this.funcDefinition.exactArgs) {
      throw new Error(
        `Intrinsic function ${this.funcDefinition.name} expects exactly ${this.funcDefinition.exactArgs} arguments, but received ${args.length}`
      );
    }

    // Validate if number of arguments provided is less than the minimum required
    if ('minArgs' in this.funcDefinition && args.length < this.funcDefinition.minArgs) {
      throw new Error(
        `Intrinsic function ${this.funcDefinition.name} expects at least ${this.funcDefinition.minArgs} arguments, but received ${args.length}`
      );
    }

    // Validate if number of arguments provided is more than the maximum required
    if ('maxArgs' in this.funcDefinition && args.length > this.funcDefinition.maxArgs) {
      throw new Error(
        `Intrinsic function ${this.funcDefinition.name} expects at most ${this.funcDefinition.maxArgs} arguments, but received ${args.length}`
      );
    }

    // Validate arguments definition
    if ('arguments' in this.funcDefinition) {
      for (let i = 0; i < this.funcDefinition.arguments.length; i++) {
        const argDefinition = this.funcDefinition.arguments[i];
        const funcArg = args[i];

        // If argument is undefined, optional argument wasn't passed, so break out of loop
        if (funcArg === undefined) break;

        let matchesAllowedType = false;
        for (const argType of argDefinition.allowedTypes) {
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

        if (!matchesAllowedType) {
          throw new Error(
            `Intrinsic function ${this.funcDefinition.name} expected argument ${
              i + 1
            } to be of type ${argDefinition.allowedTypes
              .map((type) => `"${type}"`)
              .join(' | ')}, but received ${typeof funcArg}`
          );
        }

        if (argDefinition.constraints) {
          let matchesAllConstraints = false;
          for (const constraint of argDefinition.constraints) {
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

          if (!matchesAllConstraints) {
            throw new Error(
              `Intrinsic function ${this.funcDefinition.name} expected argument ${
                i + 1
              } to satisfy the following constraints: ${argDefinition.constraints
                .map((constraint) => `"${constraint}"`)
                .join(' | ')}`
            );
          }
        }
      }
    }

    // Validate variadic arguments definition
    if ('variadicArguments' in this.funcDefinition) {
      const argDefinition = this.funcDefinition.variadicArguments;
      for (let i = this.funcDefinition.arguments?.length ?? 0; i < args.length; i++) {
        const funcArg = args[i];

        let matchesAllowedType = false;
        for (const argType of argDefinition.allowedTypes) {
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

        if (!matchesAllowedType) {
          throw new Error(
            `Intrinsic function ${this.funcDefinition.name} expected argument ${
              i + 1
            } to be of type ${argDefinition.allowedTypes
              .map((type) => `"${type}"`)
              .join(' | ')}, but received ${typeof funcArg}`
          );
        }

        if (argDefinition.constraints) {
          let matchesAllConstraints = false;
          for (const constraint of argDefinition.constraints) {
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

          if (!matchesAllConstraints) {
            throw new Error(
              `Intrinsic function ${this.funcDefinition.name} expected argument ${
                i + 1
              } to satisfy the following constraints: ${argDefinition.constraints
                .map((constraint) => `"${constraint}"`)
                .join(' | ')}`
            );
          }
        }
      }
    }
  }

  private parseArguments(input: JSONValue, context?: Context, ...args: string[]): JSONValue[] {
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

  call(input: JSONValue, context?: Context, ...args: string[]): JSONValue {
    const parsedArgs = this.parseArguments(input, context, ...args);
    this.validateArguments(...parsedArgs);

    let result = this.execute(...parsedArgs);

    // If result is a string, remove backslashes of escape chars
    if (typeof result === 'string') {
      result = result.replaceAll('\\', '');
    }

    return result;
  }
}

export { BaseIntrinsicFunction };
