import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesArrayLength extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.ArrayLength',
      exactArgs: 1,
      arguments: [
        {
          allowedTypes: ['array'],
        },
      ],
    };
  }

  protected execute(array: JSONValue[]): JSONValue {
    return array.length;
  }
}

export { StatesArrayLength };
