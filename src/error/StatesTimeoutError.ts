export class StatesTimeoutError extends Error {
  constructor() {
    super('States.Timeout');

    this.name = 'States.Timeout';
  }
}
