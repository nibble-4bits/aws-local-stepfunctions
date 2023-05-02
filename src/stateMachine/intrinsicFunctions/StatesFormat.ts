import type { IntrinsicFunctionDefinition } from '../../typings/IntrinsicFunctionsImplementation';
import type { JSONValue, JSONPrimitiveValue } from '../../typings/JSONValue';
import { BaseIntrinsicFunction } from './BaseIntrinsicFunction';
import { StatesRuntimeError } from '../../error/predefined/StatesRuntimeError';

class StatesFormat extends BaseIntrinsicFunction {
  protected readonly funcDefinition: IntrinsicFunctionDefinition;

  constructor() {
    super();

    this.funcDefinition = {
      name: 'States.Format',
      minArgs: 1,
      arguments: [
        {
          allowedTypes: ['string'],
        },
      ],
      variadicArguments: {
        allowedTypes: ['string', 'boolean', 'number', 'null'],
      },
    };
  }

  protected execute(templateStr: string, ...placeholderValues: JSONPrimitiveValue[]): JSONValue {
    const placeholdersNumber = templateStr.match(/\{\}/g)?.length ?? 0;
    if (placeholdersNumber !== placeholderValues.length) {
      throw new StatesRuntimeError(
        `Number of arguments in ${this.funcDefinition.name} do not match the occurrences of {}`
      );
    }

    let i = 0;
    return templateStr.replace(/\{\}/g, () => placeholderValues[i++] as string);
  }
}

export { StatesFormat };
