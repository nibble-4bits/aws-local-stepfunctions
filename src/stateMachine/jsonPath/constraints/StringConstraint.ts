import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';
import { quoteJSONValue } from '../../../util';

export class StringConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value !== 'string') {
      throw new StatesRuntimeError(
        `JSONPath expression '${this.pathExpression}' evaluated to ${quoteJSONValue(value)}, but expected a string`
      );
    }
  }
}
