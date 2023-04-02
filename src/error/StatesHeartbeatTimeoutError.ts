export class StatesHeartbeatTimeoutError extends Error {
  constructor() {
    super('States.HeartbeatTimeout');

    this.name = 'States.HeartbeatTimeout';
  }
}
