import { BaseState } from './BaseState';
import { TerminalState } from './TerminalState';

interface BaseFailState extends BaseState {
  Type: 'Fail';
}

export type FailState = TerminalState & BaseFailState;
