import { BaseState } from './BaseState';
import { TerminalState } from './TerminalState';

interface BaseFailState extends BaseState {
  Type: 'Fail';
  Cause?: string;
  Error?: string;
}

export type FailState = TerminalState & BaseFailState;
