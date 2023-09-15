import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';

export class ArrayConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (!Array.isArray(value)) {
      throw new StatesRuntimeError(
        `JSONPath expression '${this.pathExpression}' evaluated to ${value}, but expected an array`
      );
    }
  }
}
