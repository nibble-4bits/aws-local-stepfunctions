/**
 * Represents the timeout of a state machine execution.
 */
export class ExecutionTimeoutError extends Error {
  constructor() {
    super('Execution timed out');

    this.name = 'ExecutionTimeoutError';
  }
}
