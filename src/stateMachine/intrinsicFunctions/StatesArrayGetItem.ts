import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesArrayGetItem extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.ArrayGetItem',
      exactArgs: 2,
      arguments: [
        {
          allowedTypes: ['array'],
        },
        {
          allowedTypes: ['number'],
        },
      ],
    };
  }

  protected execute(array: JSONValue[], index: number): JSONValue {
    return array[index] ?? null;
  }
}

export { StatesArrayGetItem };
