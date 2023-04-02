import type { JSONValue } from './JSONValue';
import type { RunOptions, ValidationOptions } from './StateMachineImplementation';

export interface ExecutionResult {
  stateResult: JSONValue;
  nextState: string;
  isEndState: boolean;
}

export type TaskStateActionOptions = {
  overrideFn: ((input: JSONValue) => Promise<JSONValue>) | undefined;
};

export type MapStateActionOptions = {
  validationOptions: ValidationOptions | undefined;
  runOptions: RunOptions | undefined;
};

export type PassStateActionOptions = Record<string, unknown>;

export type WaitStateActionOptions = {
  waitTimeOverrideOption: number | undefined;
  abortSignal: AbortSignal;
};

export type ChoiceStateActionOptions = Record<string, unknown>;

export type SucceedStateActionOptions = Record<string, unknown>;

export type FailStateActionOptions = Record<string, unknown>;
