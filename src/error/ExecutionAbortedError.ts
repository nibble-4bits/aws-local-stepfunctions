/**
 * Represents the abortion of a state machine execution.
 */
export class ExecutionAbortedError extends Error {
  constructor() {
    super('Execution aborted');
  }
}
