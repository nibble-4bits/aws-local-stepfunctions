export class StatesResultWriterFailedError extends Error {
  constructor() {
    super('States.ResultWriterFailed');

    this.name = 'States.ResultWriterFailed';
  }
}
