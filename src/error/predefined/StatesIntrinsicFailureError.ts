import { RuntimeError } from '../RuntimeError';

export class StatesIntrinsicFailureError extends RuntimeError {
  constructor() {
    super('States.IntrinsicFailure');

    this.name = 'States.IntrinsicFailure';
  }
}
