import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesMathAdd extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.MathAdd',
      exactArgs: 2,
      arguments: [
        {
          allowedTypes: ['number'],
        },
        {
          allowedTypes: ['number'],
        },
      ],
    };
  }

  protected execute(num1: number, num2: number): JSONValue {
    return num1 + num2;
  }
}

export { StatesMathAdd };
