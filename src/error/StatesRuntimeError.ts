export class StatesRuntimeError extends Error {
  constructor(message = 'States.Runtime') {
    super(message);

    this.name = 'States.Runtime';
  }
}
