import type { LambdaErrorResult } from '../typings/LambdaExecution';
import { RuntimeError } from './RuntimeError';

export class LambdaInvocationError extends RuntimeError {
  constructor(name: string, message: string, cause: LambdaErrorResult) {
    super(message, cause);

    this.name = name;
  }
}
