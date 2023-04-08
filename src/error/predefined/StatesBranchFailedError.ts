import { RuntimeError } from '../RuntimeError';

export class StatesBranchFailedError extends RuntimeError {
  constructor() {
    super('States.BranchFailed');

    this.name = 'States.BranchFailed';
  }
}
