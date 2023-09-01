import type { JSONValue } from './JSONValue';
import type { AWSConfig, RunOptions, StateMachineOptions } from './StateMachineImplementation';
import type { EventLogger } from '../stateMachine/EventLogger';

export interface ExecutionResult {
  stateResult: JSONValue;
  nextState: string;
  isEndState: boolean;
}

export type TaskStateActionOptions = {
  overrideFn: ((input: JSONValue) => Promise<JSONValue>) | undefined;
  awsConfig: AWSConfig | undefined;
};

export type ParallelStateActionOptions = {
  stateMachineOptions: StateMachineOptions | undefined;
  runOptions: RunOptions | undefined;
  eventLogger: EventLogger;
};

export type MapStateActionOptions = {
  stateMachineOptions: StateMachineOptions | undefined;
  runOptions: RunOptions | undefined;
  eventLogger: EventLogger;
};

export type PassStateActionOptions = Record<string, unknown>;

export type WaitStateActionOptions = {
  waitTimeOverrideOption: number | undefined;
  abortSignal: AbortSignal;
  rootAbortSignal: AbortSignal | undefined;
};

export type ChoiceStateActionOptions = Record<string, unknown>;

export type SucceedStateActionOptions = Record<string, unknown>;

export type FailStateActionOptions = Record<string, unknown>;
