import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import { StatesRuntimeError } from '../../error/predefined/StatesRuntimeError';

class StatesArrayRange extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.ArrayRange',
      exactArgs: 3,
      arguments: [
        {
          allowedTypes: ['number'],
          constraints: ['INTEGER'],
        },
        {
          allowedTypes: ['number'],
          constraints: ['INTEGER'],
        },
        {
          allowedTypes: ['number'],
          constraints: ['POSITIVE_INTEGER', 'NEGATIVE_INTEGER'],
        },
      ],
    };
  }

  protected execute(start: number, end: number, step: number): JSONValue {
    const slots = (end - start) / step;
    if (slots < 0) {
      return [];
    }

    const arrLength = Math.floor(slots) + 1;
    if (arrLength > 1000) {
      throw new StatesRuntimeError(
        `Result of intrinsic function ${this.funcDefinition.name} cannot contain more than 1000 items`
      );
    }

    const range = Array.from({ length: arrLength }).map((_, i) => start + step * i);

    return range;
  }
}

export { StatesArrayRange };
