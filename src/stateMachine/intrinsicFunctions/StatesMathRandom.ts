import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { cyrb128, sfc32, getRandomNumber } from '../../util';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesMathRandom extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.MathRandom',
      minArgs: 2,
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
        },
      ],
    };
  }

  protected execute(min: number, max: number, seed: number): JSONValue {
    const [s1, s2, s3, s4] = cyrb128((seed ?? Date.now()).toString());
    const rng = sfc32(s1, s2, s3, s4);

    return getRandomNumber(min, max, rng);
  }
}

export { StatesMathRandom };
