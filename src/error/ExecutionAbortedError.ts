import { CustomError } from './CustomError';

/**
 * Represents the abortion of a state machine execution.
 */
export class ExecutionAbortedError extends CustomError {
  constructor() {
    super('Execution aborted');

    this.name = 'ExecutionAbortedError';
  }

  toString(): string {
    return 'Execution aborted';
  }
}
