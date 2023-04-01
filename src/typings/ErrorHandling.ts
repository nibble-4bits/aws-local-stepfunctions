type Retrier = {
  ErrorEquals: string[];
  IntervalSeconds?: number; // default 1
  MaxAttempts?: number; // default 3
  BackoffRate?: number; // default 2.0
};

export interface RetryableState {
  Retry?: Retrier[];
}

type Catcher = {
  ErrorEquals: string[];
  Next: string;
  ResultPath?: string;
};

export interface CatchableState {
  Catch?: Catcher[];
}

export type ErrorOutput = {
  Error: string;
  Cause?: string;
};
