export class ExecutionError extends Error {
  constructor(caughtError: Error) {
    super(`Execution has failed with the following error: ${caughtError.message}`);
  }
}
