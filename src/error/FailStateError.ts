export class FailStateError extends Error {
  constructor(name = 'FailStateError', message = 'Execution failed because of a Fail state') {
    super(message);

    this.name = name;
  }
}
