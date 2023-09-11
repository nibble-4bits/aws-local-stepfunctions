import type { RuntimeError } from './RuntimeError';
import { ErrorWithCause } from './ErrorWithCause';

/**
 * Represents the failure of a state machine execution.
 */
export class ExecutionError extends ErrorWithCause {
  constructor(caughtError: RuntimeError) {
    super(`Execution has failed with the following error: ${caughtError.message}`, { cause: caughtError });

    this.name = 'ExecutionError';
  }
}
