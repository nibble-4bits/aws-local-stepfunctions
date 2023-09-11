import type { JSONValue } from './JSONValue';
import type { StateType } from './StateType';

type ExecutionStartedEventType = 'ExecutionStarted';
type ExecutionSucceededEventType = 'ExecutionSucceeded';
type ExecutionFailedEventType = 'ExecutionFailed';
type ExecutionTerminatedEventType = 'ExecutionAborted' | 'ExecutionTimeout';

type MapIterationEventType = 'MapIterationStarted' | 'MapIterationSucceeded';
type MapIterationFailedEventType = 'MapIterationFailed';

type ParallelBranchEventType = 'ParallelBranchStarted' | 'ParallelBranchSucceeded';
type ParallelBranchFailedEventType = 'ParallelBranchFailed';

type StateEventType = 'StateEntered' | 'StateExited';

type AllEventTypes =
  | ExecutionStartedEventType
  | ExecutionSucceededEventType
  | ExecutionFailedEventType
  | ExecutionTerminatedEventType
  | MapIterationEventType
  | MapIterationFailedEventType
  | ParallelBranchEventType
  | ParallelBranchFailedEventType
  | StateEventType;

interface StateData {
  name: string;
  type: StateType;
  input: JSONValue;
  output?: JSONValue;
}

interface ErrorInfo {
  Error: string;
  Cause: unknown;
}

interface BaseEvent {
  type: AllEventTypes;
  timestamp: number;
}

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

interface BaseMapIterationEvent extends BaseEvent {
  type: MapIterationEventType | MapIterationFailedEventType;
  parentState: StateData;
  index: number;
}

interface MapIterationEvent extends BaseMapIterationEvent {
  type: MapIterationEventType;
}

interface MapIterationFailedEvent extends BaseMapIterationEvent, ErrorInfo {
  type: MapIterationFailedEventType;
}

interface BaseParallelBranchEvent extends BaseEvent {
  type: ParallelBranchEventType | ParallelBranchFailedEventType;
  parentState: StateData;
}

interface ParallelBranchEvent extends BaseParallelBranchEvent {
  type: ParallelBranchEventType;
}

interface ParallelBranchFailedEvent extends BaseParallelBranchEvent, ErrorInfo {
  type: ParallelBranchFailedEventType;
}

export interface StateEvent extends BaseEvent {
  type: StateEventType;
  state: StateData;
  index?: number; // used to identify what iteration a state that is within a `Map` state belongs to
}

export type EventLog =
  | ExecutionStartedEvent
  | ExecutionSucceededEvent
  | ExecutionFailedEvent
  | ExecutionTerminatedEvent
  | MapIterationEvent
  | MapIterationFailedEvent
  | ParallelBranchEvent
  | ParallelBranchFailedEvent
  | StateEvent;
