import type { BaseState } from './BaseState';
import type { CanHaveInputPath, CanHaveOutputPath } from './InputOutputProcessing';
import type { IntermediateState } from './IntermediateState';
import type { TerminalState } from './TerminalState';

interface BaseWaitState extends BaseState, CanHaveInputPath, CanHaveOutputPath {
  Type: 'Wait';
  Seconds?: number;
  Timestamp?: string;
  SecondsPath?: string;
  TimestampPath?: string;
}

export type WaitState = (IntermediateState | TerminalState) & BaseWaitState;
