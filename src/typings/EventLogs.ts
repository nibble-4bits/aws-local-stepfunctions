import type { ErrorOutput } from './ErrorHandling';
import type { JSONValue } from './JSONValue';
import type { StateType } from './StateType';

type ExecutionEventType =
  | 'ExecutionStarted'
  | 'ExecutionSucceeded'
  | 'MapIterationStarted'
  | 'MapIterationSucceeded'
  | 'ParallelBranchStarted'
  | 'ParallelBranchSucceeded'
  | 'ExecutionAborted'
  | 'ExecutionTimeout';
type ExecutionFailedEventType = 'ExecutionFailed' | 'ParallelBranchFailed' | 'MapIterationFailed';
type StateEventType = 'StateEntered' | 'StateExited';

type AllEventTypes = ExecutionEventType | ExecutionFailedEventType | StateEventType;

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

interface StateData {
  name: string;
  type: StateType;
  input: JSONValue;
  output?: JSONValue;
}

interface StateEvent extends BaseEvent {
  type: StateEventType;
  state: StateData;
}

export type EventLog = ExecutionEvent | ExecutionFailedEvent | StateEvent;
