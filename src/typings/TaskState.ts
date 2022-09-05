import { BaseState } from './BaseState';
import {
  CanHaveInputPath,
  CanHaveOutputPath,
  CanHaveParameters,
  CanHaveResultPath,
  CanHaveResultSelector,
} from './InputOutputProcessing';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BaseTaskState
  extends BaseState,
    CanHaveInputPath,
    CanHaveParameters,
    CanHaveResultSelector,
    CanHaveResultPath,
    CanHaveOutputPath {
  Type: 'Task';
  Resource: string;
}

export type TaskState = (IntermediateState | TerminalState) & BaseTaskState;
