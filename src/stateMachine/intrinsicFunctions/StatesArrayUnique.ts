import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import isEqual from 'lodash/isEqual.js';
import uniqWith from 'lodash/uniqWith.js';

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
    return uniqWith(array, isEqual);
  }
}

export { StatesArrayUnique };
