import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import type { Context } from '../../typings/Context';
import { parseArguments, validateArguments } from './ArgumentHandling';

abstract class BaseIntrinsicFunction {
  protected abstract readonly funcDefinition: IntrinsicFunctionDefinition;

  protected abstract execute(...args: JSONValue[]): JSONValue;

  call(input: JSONValue, context: Context, ...args: string[]): JSONValue {
    const parsedArgs = parseArguments(input, context, ...args);
    validateArguments(this.funcDefinition, ...parsedArgs);

    let result = this.execute(...parsedArgs);

    // If result is a string, remove backslashes of escape chars
    if (typeof result === 'string') {
      result = result.replaceAll('\\', '');
    }

    return result;
  }
}

export { BaseIntrinsicFunction };
