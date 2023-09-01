import type { ErrorOutput } from './ErrorHandling';
import type { JSONValue } from './JSONValue';
import type { StateType } from './StateType';

type ExecutionEventType = 'ExecutionStarted' | 'ExecutionSucceeded' | 'ExecutionAborted' | 'ExecutionTimeout';
type ExecutionFailedEventType = 'ExecutionFailed';

type MapIterationEventType = 'MapIterationStarted' | 'MapIterationSucceeded';
type MapIterationFailedEventType = 'MapIterationFailed';

type ParallelBranchEventType = 'ParallelBranchStarted' | 'ParallelBranchSucceeded';
type ParallelBranchFailedEventType = 'ParallelBranchFailed';

type StateEventType = 'StateEntered' | 'StateExited';

type AllEventTypes =
  | ExecutionEventType
  | ExecutionFailedEventType
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

interface BaseEvent {
  type: AllEventTypes;
  timestamp: number;
}

interface ExecutionEvent extends BaseEvent {
  type: ExecutionEventType;
}

interface ExecutionFailedEvent extends BaseEvent, ErrorOutput {
  type: ExecutionFailedEventType;
}

interface BaseMapIterationEvent extends BaseEvent {
  type: MapIterationEventType | MapIterationFailedEventType;
  parentState: StateData;
  index: number;
}

export interface MapIterationEvent extends BaseMapIterationEvent {
  type: MapIterationEventType;
}

export interface MapIterationFailedEvent extends BaseMapIterationEvent, ErrorOutput {
  type: MapIterationFailedEventType;
}

interface BaseParallelBranchEvent extends BaseEvent {
  type: ParallelBranchEventType | ParallelBranchFailedEventType;
  parentState: StateData;
}

export interface ParallelBranchEvent extends BaseParallelBranchEvent {
  type: ParallelBranchEventType;
}

export interface ParallelBranchFailedEvent extends BaseParallelBranchEvent, ErrorOutput {
  type: ParallelBranchFailedEventType;
}

export interface StateEvent extends BaseEvent {
  type: StateEventType;
  state: StateData;
  index?: number; // used to identify what iteration a state that is within a `Map` state belongs to
}

export type EventLog =
  | ExecutionEvent
  | ExecutionFailedEvent
  | MapIterationEvent
  | MapIterationFailedEvent
  | ParallelBranchEvent
  | ParallelBranchFailedEvent
  | StateEvent;
