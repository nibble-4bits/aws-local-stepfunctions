import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';
import { stringifyJSONValue } from '../../../util';

export class NumberConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value !== 'number') {
      throw new StatesRuntimeError(
        `Path expression '${this.pathExpression}' evaluated to ${stringifyJSONValue(value)}, but expected a number`
      );
    }
  }
}
