/**
 * Represents the abort of a state machine execution.
 */
export class ExecutionAbortedError extends Error {
  constructor() {
    super('Execution aborted');

    this.name = 'ExecutionAbortedError';
  }
}
