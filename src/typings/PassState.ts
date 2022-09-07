import { BaseState } from './BaseState';
import { CanHaveInputPath, CanHaveOutputPath, CanHaveParameters, CanHaveResultPath } from './InputOutputProcessing';
import { IntermediateState } from './IntermediateState';
import { JSONValue } from './JSONValue';
import { TerminalState } from './TerminalState';

interface BasePassState extends BaseState, CanHaveInputPath, CanHaveParameters, CanHaveResultPath, CanHaveOutputPath {
  Type: 'Pass';
  Result?: JSONValue;
}

export type PassState = (IntermediateState | TerminalState) & BasePassState;
