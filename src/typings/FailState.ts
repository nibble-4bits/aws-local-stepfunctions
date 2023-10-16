import type { BaseState } from './BaseState';
import type { TerminalState } from './TerminalState';

interface BaseFailState extends BaseState {
  Type: 'Fail';
  Cause?: string;
  CausePath?: string;
  Error?: string;
  ErrorPath?: string;
}

export type FailState = TerminalState & BaseFailState;
