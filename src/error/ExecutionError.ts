import type { RuntimeError } from './RuntimeError';

/**
 * Represents the failure of a state machine execution.
 */
export class ExecutionError extends Error {
  #wrappedError: RuntimeError;

  constructor(caughtError: RuntimeError) {
    super(`Execution has failed with the following error: ${caughtError.message}`);

    this.name = 'ExecutionError';
    this.#wrappedError = caughtError;
  }

  public get getWrappedError(): RuntimeError {
    return this.#wrappedError;
  }
}
