import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesStringSplit extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.StringSplit',
      exactArgs: 2,
      arguments: [
        {
          allowedTypes: ['string'],
        },
        {
          allowedTypes: ['string'],
        },
      ],
    };
  }

  protected execute(str: string, separator: string): JSONValue {
    return str.split(separator);
  }
}

export { StatesStringSplit };
