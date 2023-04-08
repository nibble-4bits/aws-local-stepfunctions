import { RuntimeError } from '../RuntimeError';

export class StatesTimeoutError extends RuntimeError {
  constructor() {
    super('States.Timeout');

    this.name = 'States.Timeout';
  }
}
