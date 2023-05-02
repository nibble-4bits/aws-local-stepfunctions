import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesJsonToString extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.JsonToString',
      exactArgs: 1,
      arguments: [
        {
          allowedTypes: ['any'],
        },
      ],
    };
  }

  protected execute(json: JSONValue): JSONValue {
    return JSON.stringify(json);
  }
}

export { StatesJsonToString };
