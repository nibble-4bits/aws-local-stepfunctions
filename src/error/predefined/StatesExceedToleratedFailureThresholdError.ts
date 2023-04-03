export class StatesExceedToleratedFailureThresholdError extends Error {
  constructor() {
    super('States.ExceedToleratedFailureThreshold');

    this.name = 'States.ExceedToleratedFailureThreshold';
  }
}
