import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';

export class DefinedValueConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value === 'undefined') {
      throw new StatesRuntimeError(`Path expression '${this.pathExpression}' does not point to a value`);
    }
  }
}
