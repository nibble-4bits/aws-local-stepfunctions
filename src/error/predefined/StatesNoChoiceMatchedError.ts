import { RuntimeError } from '../RuntimeError';

export class StatesNoChoiceMatchedError extends RuntimeError {
  constructor() {
    super('States.NoChoiceMatched');

    this.name = 'States.NoChoiceMatched';
  }
}
