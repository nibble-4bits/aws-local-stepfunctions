import { RuntimeError } from '../RuntimeError';

export class StatesHeartbeatTimeoutError extends RuntimeError {
  constructor() {
    super('States.HeartbeatTimeout');

    this.name = 'States.HeartbeatTimeout';
  }
}
