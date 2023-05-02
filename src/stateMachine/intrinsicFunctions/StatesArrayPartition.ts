import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesArrayPartition extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.ArrayPartition',
      exactArgs: 2,
      arguments: [
        {
          allowedTypes: ['array'],
        },
        {
          allowedTypes: ['number'],
          constraints: ['POSITIVE_INTEGER'],
        },
      ],
    };
  }

  protected execute(array: JSONValue[], chunkSize: number): JSONValue {
    const partitionedArr = [];

    for (let i = 0; i < array.length; i += chunkSize) {
      const subArray = array.slice(i, i + chunkSize);
      partitionedArr.push(subArray);
    }

    return partitionedArr;
  }
}

export { StatesArrayPartition };
