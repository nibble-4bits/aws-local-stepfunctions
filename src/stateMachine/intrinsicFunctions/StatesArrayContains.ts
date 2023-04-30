import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import isEqual from 'lodash/isEqual.js';

class StatesArrayContains extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.ArrayContains',
      exactArgs: 2,
      arguments: [
        {
          allowedTypes: ['array'],
        },
        {
          allowedTypes: ['any'],
        },
      ],
    };
  }

  protected execute(array: JSONValue[], searchVal: JSONValue): JSONValue {
    return array.findIndex((val) => isEqual(val, searchVal)) > -1;
  }
}

export { StatesArrayContains };
