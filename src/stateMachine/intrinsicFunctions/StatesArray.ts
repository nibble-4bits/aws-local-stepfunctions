import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesArray extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.Array',
      variadicArguments: {
        allowedTypes: ['any'],
      },
    };
  }

  protected execute(...args: JSONValue[]): JSONValue {
    return args;
  }
}

export { StatesArray };
