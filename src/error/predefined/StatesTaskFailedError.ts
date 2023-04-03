import { RuntimeError } from '../RuntimeError';

export class StatesTaskFailedError extends RuntimeError {
  constructor() {
    super('States.TaskFailed');

    this.name = 'States.TaskFailed';
  }
}
