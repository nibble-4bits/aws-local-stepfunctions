import { BaseState } from './BaseState';
import { CanHaveInputPath, CanHaveOutputPath, CanHaveParameters, CanHaveResultPath } from './InputOutputProcessing';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BasePassState extends BaseState, CanHaveInputPath, CanHaveParameters, CanHaveResultPath, CanHaveOutputPath {
  Type: 'Pass';
  Result?: unknown;
}

export type PassState = (IntermediateState | TerminalState) & BasePassState;
