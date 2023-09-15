import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';

export class NumberConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value !== 'number') {
      throw new StatesRuntimeError(
        `JSONPath expression '${this.pathExpression}' evaluated to ${value}, but expected a number`
      );
    }
  }
}
