import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONObject, JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import { StatesRuntimeError } from '../../error/predefined/StatesRuntimeError';

class StatesJsonMerge extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.JsonMerge',
      exactArgs: 3,
      arguments: [
        {
          allowedTypes: ['object'],
        },
        {
          allowedTypes: ['object'],
        },
        {
          allowedTypes: ['boolean'],
        },
      ],
    };
  }

  protected execute(obj1: JSONObject, obj2: JSONObject, isDeepMerge: boolean): JSONValue {
    if (isDeepMerge) {
      throw new StatesRuntimeError(
        `Deep merge option is not supported in ${this.funcDefinition.name}. Third argument must be set to false instead of true`
      );
    }

    return Object.assign(obj1, obj2);
  }
}

export { StatesJsonMerge };
