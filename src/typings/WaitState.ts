import { BaseState } from './BaseState';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BaseWaitState extends BaseState {
  Type: 'Wait';
  InputPath?: string;
  OutputPath?: string;
}

export type WaitState = (IntermediateState | TerminalState) & BaseWaitState;
