import { RuntimeError } from '../RuntimeError';

export class StatesPermissionsError extends RuntimeError {
  constructor() {
    super('States.Permissions');

    this.name = 'States.Permissions';
  }
}
