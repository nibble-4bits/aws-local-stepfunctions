export class StatesNoChoiceMatchedError extends Error {
  constructor() {
    super('States.NoChoiceMatched');

    this.name = 'States.NoChoiceMatched';
  }
}
