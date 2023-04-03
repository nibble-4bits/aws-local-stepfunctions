export class StatesTaskFailedError extends Error {
  constructor() {
    super('States.TaskFailed');

    this.name = 'States.TaskFailed';
  }
}
