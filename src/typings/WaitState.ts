import { BaseState } from './BaseState';
import { CanHaveInputPath, CanHaveOutputPath } from './InputOutputProcessing';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BaseWaitState extends BaseState, CanHaveInputPath, CanHaveOutputPath {
  Type: 'Wait';
  Seconds?: number;
  Timestamp?: string;
  SecondsPath?: string;
  TimestampPath?: string;
}

export type WaitState = (IntermediateState | TerminalState) & BaseWaitState;
