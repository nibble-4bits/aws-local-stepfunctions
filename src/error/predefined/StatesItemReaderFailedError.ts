import { RuntimeError } from '../RuntimeError';

export class StatesItemReaderFailedError extends RuntimeError {
  constructor() {
    super('States.ItemReaderFailed');

    this.name = 'States.ItemReaderFailed';
  }
}
