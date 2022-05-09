import { BaseState } from './BaseState';
import { TerminalState } from './TerminalState';

interface BaseSucceedState extends BaseState {
  Type: 'Succeed';
  InputPath?: string;
  OutputPath?: string;
}

export type SucceedState = TerminalState & BaseSucceedState;
