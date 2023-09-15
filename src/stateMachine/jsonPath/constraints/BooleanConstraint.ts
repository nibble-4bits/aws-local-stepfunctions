import { BaseJSONPathConstraint } from './BaseJsonPathConstraint';
import { StatesRuntimeError } from '../../../error/predefined/StatesRuntimeError';
import { quoteJSONValue } from '../../../util';

export class BooleanConstraint extends BaseJSONPathConstraint {
  test(value: unknown): void {
    if (typeof value !== 'boolean') {
      throw new StatesRuntimeError(
        `Path expression '${this.pathExpression}' evaluated to ${quoteJSONValue(value)}, but expected a boolean`
      );
    }
  }
}
