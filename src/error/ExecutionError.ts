import type { RuntimeError } from './RuntimeError';

/**
 * Represents the failure of a state machine execution.
 */
export class ExecutionError extends Error {
  constructor(caughtError: RuntimeError) {
    super(`Execution has failed with the following error: ${caughtError.message}`, { cause: caughtError });

    this.name = 'ExecutionError';
  }
}
