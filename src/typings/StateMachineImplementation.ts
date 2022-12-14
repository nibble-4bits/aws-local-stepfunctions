import type { StateType } from './StateType';

type TaskStateResourceLocalHandler = {
  [taskStateName: string]: (...args: any) => any;
};

interface Overrides {
  taskResourceLocalHandlers?: TaskStateResourceLocalHandler;
}

export interface RunOptions {
  overrides?: Overrides;
}

export type StateHandler = {
  [T in StateType]: (options?: RunOptions) => Promise<void>;
};

export interface ValidationOptions {
  readonly checkPaths?: boolean;
  readonly checkArn?: boolean;
}
