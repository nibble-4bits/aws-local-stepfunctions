import { RuntimeError } from '../RuntimeError';

export class StatesRuntimeError extends RuntimeError {
  constructor(message = 'States.Runtime') {
    super(message);

    this.name = 'States.Runtime';
    this.retryable = false;
    this.catchable = false;
  }
}
