import { BaseState } from './BaseState';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BasePassState extends BaseState {
  Type: 'Pass';
  InputPath?: string;
  OutputPath?: string;
  Result?: unknown;
  ResultPath?: string;
  Parameters?: Record<string, unknown>;
}

export type PassState = (IntermediateState | TerminalState) & BasePassState;
