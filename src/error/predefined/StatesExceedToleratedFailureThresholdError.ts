import { RuntimeError } from '../RuntimeError';

export class StatesExceedToleratedFailureThresholdError extends RuntimeError {
  constructor() {
    super('States.ExceedToleratedFailureThreshold');

    this.name = 'States.ExceedToleratedFailureThreshold';
  }
}
