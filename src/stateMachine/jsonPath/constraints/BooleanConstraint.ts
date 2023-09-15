import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';

export class BooleanConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value !== 'boolean') {
      throw new StatesRuntimeError(
        `JSONPath expression '${this.pathExpression}' evaluated to ${value}, but expected a boolean`
      );
    }
  }
}
