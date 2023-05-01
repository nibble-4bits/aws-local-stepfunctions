import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import { StatesRuntimeError } from '../../error/predefined/StatesRuntimeError';

class StatesBase64Decode extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.Base64Decode',
      exactArgs: 1,
      arguments: [
        {
          allowedTypes: ['string'],
        },
      ],
    };
  }

  protected execute(str: string): JSONValue {
    if (str.length > 10000) {
      throw new StatesRuntimeError(
        `Intrinsic function ${this.funcDefinition.name} cannot decode a Base64 string with more than 10,000 characters`
      );
    }

    return atob(str);
  }
}

export { StatesBase64Decode };
