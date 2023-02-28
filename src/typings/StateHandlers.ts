import type { JSONValue } from './JSONValue';
import type { RunOptions, ValidationOptions } from './StateMachineImplementation';

export interface ExecutionResult {
  stateResult: JSONValue;
  nextState: string;
  isEndState: boolean;
}

export type TaskStateHandlerOptions = {
  overrideFn: ((input: JSONValue) => Promise<JSONValue>) | undefined;
};

export type MapStateHandlerOptions = {
  validationOptions: ValidationOptions | undefined;
  runOptions: RunOptions | undefined;
};

export type PassStateHandlerOptions = Record<string, unknown>;

export type WaitStateHandlerOptions = {
  waitTimeOverrideOption: number | undefined;
  abortSignal: AbortSignal;
};

export type ChoiceStateHandlerOptions = Record<string, unknown>;

export type SucceedStateHandlerOptions = Record<string, unknown>;

export type FailStateHandlerOptions = Record<string, unknown>;
