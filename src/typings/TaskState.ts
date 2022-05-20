import { BaseState } from './BaseState';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BaseTaskState extends BaseState {
  Type: 'Task';
  Resource: string;
  InputPath?: string;
  OutputPath?: string;
  ResultPath?: string;
  Parameters?: Record<string, unknown>;
  ResultSelector?: string;
}

export type TaskState = (IntermediateState | TerminalState) & BaseTaskState;
