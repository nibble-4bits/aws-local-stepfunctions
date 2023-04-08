import { RuntimeError } from '../RuntimeError';

export class StatesParameterPathFailureError extends RuntimeError {
  constructor() {
    super('States.ParameterPathFailure');

    this.name = 'States.ParameterPathFailure';
  }
}
