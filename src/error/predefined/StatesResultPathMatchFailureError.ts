import { RuntimeError } from '../RuntimeError';

export class StatesResultPathMatchFailureError extends RuntimeError {
  constructor() {
    super('States.ResultPathMatchFailure');

    this.name = 'States.ResultPathMatchFailure';
  }
}
