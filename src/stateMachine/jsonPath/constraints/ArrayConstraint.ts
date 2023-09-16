import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';
import { stringifyJSONValue } from '../../../util';

export class ArrayConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (!Array.isArray(value)) {
      throw new StatesRuntimeError(
        `Path expression '${this.pathExpression}' evaluated to ${stringifyJSONValue(value)}, but expected an array`
      );
    }
  }
}
