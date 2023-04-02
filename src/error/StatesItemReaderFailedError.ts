export class StatesItemReaderFailedError extends Error {
  constructor() {
    super('States.ItemReaderFailed');

    this.name = 'States.ItemReaderFailed';
  }
}
