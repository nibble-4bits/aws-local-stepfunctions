import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';

class StatesStringToJson extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.StringToJson',
      exactArgs: 1,
      arguments: [
        {
          allowedTypes: ['string'],
        },
      ],
    };
  }

  protected execute(jsonString: string): JSONValue {
    return JSON.parse(jsonString);
  }
}

export { StatesStringToJson };
