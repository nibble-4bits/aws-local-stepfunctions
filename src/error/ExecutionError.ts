/**
 * Represents the failure of a state machine execution.
 */
export class ExecutionError extends Error {
  #wrappedError: Error;

  constructor(caughtError: Error) {
    super(`Execution has failed with the following error: ${caughtError.message}`);

    this.name = 'ExecutionError';
    this.#wrappedError = caughtError;
  }

  public get getWrappedError(): Error {
    return this.#wrappedError;
  }
}
