export class StatesBranchFailedError extends Error {
  constructor() {
    super('States.BranchFailed');

    this.name = 'States.BranchFailed';
  }
}
