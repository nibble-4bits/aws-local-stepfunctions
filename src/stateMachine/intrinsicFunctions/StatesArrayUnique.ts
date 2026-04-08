import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import { isEqualJSON } from '../../util';

class StatesArrayUnique extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.ArrayUnique',
      exactArgs: 1,
      arguments: [
        {
          allowedTypes: ['array'],
        },
      ],
    };
  }

  protected execute(array: JSONValue[]): JSONValue {
    return array.filter((val, i) => array.findIndex((other) => isEqualJSON(val, other)) === i);
  }
}

export { StatesArrayUnique };
