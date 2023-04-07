/**
 * Base class for all internal errors that can be thrown during the state machine execution.
 */
export class RuntimeError extends Error {
  /**
   * Whether this runtime error can be matched in a `Retry` field
   */
  protected retryable: boolean;

  /**
   * Whether this runtime error can be caught in a `Catch` field
   */
  protected catchable: boolean;

  constructor(message: string) {
    super(message);

    this.name = 'RuntimeError';
    this.retryable = true;
    this.catchable = true;
  }

  public get isRetryable(): boolean {
    return this.retryable;
  }

  public get isCatchable(): boolean {
    return this.catchable;
  }
}
