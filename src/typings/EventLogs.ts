import type { Catcher, Retrier } from './ErrorHandling';
import type { JSONValue } from './JSONValue';
import type { StateType } from './StateType';

// ============================== Execution event types ==============================

type ExecutionStartedEventType = 'ExecutionStarted';
type ExecutionSucceededEventType = 'ExecutionSucceeded';
type ExecutionFailedEventType = 'ExecutionFailed';
type ExecutionTerminatedEventType = 'ExecutionAborted' | 'ExecutionTimeout';
type ExecutionEventType =
  | ExecutionStartedEventType
  | ExecutionSucceededEventType
  | ExecutionFailedEventType
  | ExecutionTerminatedEventType;

// ============================== Map iteration event types ==============================

type MapIterationStartedEventType = 'MapIterationStarted';
type MapIterationSucceededEventType = 'MapIterationSucceeded';
type MapIterationFailedEventType = 'MapIterationFailed';
type MapIterationEventType =
  | MapIterationStartedEventType
  | MapIterationSucceededEventType
  | MapIterationFailedEventType;

// ============================== Parallel branch event types ==============================

type ParallelBranchStartedEventType = 'ParallelBranchStarted';
type ParallelBranchSucceededEventType = 'ParallelBranchSucceeded';
type ParallelBranchFailedEventType = 'ParallelBranchFailed';
type ParallelBranchEventType =
  | ParallelBranchStartedEventType
  | ParallelBranchSucceededEventType
  | ParallelBranchFailedEventType;

// ============================== State event types ==============================

type StateEnteredEventType = 'StateEntered';
type StateExitedEventType = 'StateExited';
type StateFailedEventType = 'StateFailed';
type StateRetriedEventType = 'StateRetried';
type StateCaughtEventType = 'StateCaught';
type StateEventType =
  | StateEnteredEventType
  | StateExitedEventType
  | StateFailedEventType
  | StateRetriedEventType
  | StateCaughtEventType;

type AllEventTypes = ExecutionEventType | MapIterationEventType | ParallelBranchEventType | StateEventType;

// ============================== Helper types ==============================

interface StateData {
  name: string;
  type: StateType;
  input: JSONValue;
  output?: JSONValue;
}

interface RetryData {
  retrier: Retrier;
  attempt: number;
}

interface CatchData {
  catcher: Catcher;
}

interface ErrorInfo {
  Error: string;
  Cause: unknown;
}

interface BaseEvent {
  type: AllEventTypes;
  timestamp: number;
}

// ============================== Execution events ==============================

export interface ExecutionStartedEvent extends BaseEvent {
  type: ExecutionStartedEventType;
  input: JSONValue;
}

export interface ExecutionSucceededEvent extends BaseEvent {
  type: ExecutionSucceededEventType;
  output: JSONValue;
}

export interface ExecutionFailedEvent extends BaseEvent, ErrorInfo {
  type: ExecutionFailedEventType;
}

export interface ExecutionTerminatedEvent extends BaseEvent {
  type: ExecutionTerminatedEventType;
}

// ============================== Map iteration events ==============================

interface BaseMapIterationEvent extends BaseEvent {
  type: MapIterationEventType;
  parentState: StateData;
  index: number;
}

export interface MapIterationStartedEvent extends BaseMapIterationEvent {
  type: MapIterationStartedEventType;
}

export interface MapIterationSucceededEvent extends BaseMapIterationEvent {
  type: MapIterationSucceededEventType;
}

export interface MapIterationFailedEvent extends BaseMapIterationEvent, ErrorInfo {
  type: MapIterationFailedEventType;
}

// ============================== Parallel branch events ==============================

interface BaseParallelBranchEvent extends BaseEvent {
  type: ParallelBranchEventType;
  parentState: StateData;
}

export interface ParallelBranchStartedEvent extends BaseParallelBranchEvent {
  type: ParallelBranchStartedEventType;
}

export interface ParallelBranchSucceededEvent extends BaseParallelBranchEvent {
  type: ParallelBranchSucceededEventType;
}

export interface ParallelBranchFailedEvent extends BaseParallelBranchEvent, ErrorInfo {
  type: ParallelBranchFailedEventType;
}

// ============================== State events ==============================

interface BaseStateEvent extends BaseEvent {
  type: StateEventType;
  state: StateData;
  index?: number; // used to identify what iteration a state that is within a `Map` state belongs to
}

export interface StateEnteredEvent extends BaseStateEvent {
  type: StateEnteredEventType;
}

export interface StateExitedEvent extends BaseStateEvent {
  type: StateExitedEventType;
}

export interface StateRetriedEvent extends BaseStateEvent {
  type: StateRetriedEventType;
  retry: RetryData;
}

export interface StateFailedEvent extends BaseStateEvent, ErrorInfo {
  type: StateFailedEventType;
}

export interface StateRetriedEvent extends BaseStateEvent {
  type: StateRetriedEventType;
  retry: RetryData;
}

export interface StateCaughtEvent extends BaseStateEvent {
  type: StateCaughtEventType;
  catch: CatchData;
}

// ============================== Event log type ==============================

export type EventLog =
  | ExecutionStartedEvent
  | ExecutionSucceededEvent
  | ExecutionFailedEvent
  | ExecutionTerminatedEvent
  | MapIterationStartedEvent
  | MapIterationSucceededEvent
  | MapIterationFailedEvent
  | ParallelBranchStartedEvent
  | ParallelBranchSucceededEvent
  | ParallelBranchFailedEvent
  | StateEnteredEvent
  | StateExitedEvent
  | StateFailedEvent
  | StateRetriedEvent
  | StateCaughtEvent;
