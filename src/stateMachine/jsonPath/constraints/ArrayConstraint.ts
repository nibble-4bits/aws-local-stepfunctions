import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';
import { quoteJSONValue } from '../../../util';

export class ArrayConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (!Array.isArray(value)) {
      throw new StatesRuntimeError(
        `JSONPath expression '${this.pathExpression}' evaluated to ${quoteJSONValue(value)}, but expected an array`
      );
    }
  }
}
