import { RuntimeError } from './RuntimeError';

export class FailStateError extends RuntimeError {
  constructor(name = 'FailStateError', message = 'Execution failed because of a Fail state') {
    super(message);

    this.name = name;
  }
}
