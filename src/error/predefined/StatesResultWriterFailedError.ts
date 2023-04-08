import { RuntimeError } from '../RuntimeError';

export class StatesResultWriterFailedError extends RuntimeError {
  constructor() {
    super('States.ResultWriterFailed');

    this.name = 'States.ResultWriterFailed';
  }
}
