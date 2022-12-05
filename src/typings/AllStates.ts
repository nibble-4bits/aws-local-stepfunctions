import type { ChoiceState } from './ChoiceState';
import type { FailState } from './FailState';
import type { MapState } from './MapState';
import type { PassState } from './PassState';
import type { SucceedState } from './SucceedState';
import type { TaskState } from './TaskState';
import type { WaitState } from './WaitState';

export type AllStates = TaskState | MapState | PassState | WaitState | ChoiceState | SucceedState | FailState;
