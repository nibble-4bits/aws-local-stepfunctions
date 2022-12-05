import type { BaseState } from './BaseState';
import type {
  CanHaveInputPath,
  CanHaveOutputPath,
  CanHaveParameters,
  CanHaveResultPath,
} from './InputOutputProcessing';
import type { IntermediateState } from './IntermediateState';
import type { JSONValue } from './JSONValue';
import type { TerminalState } from './TerminalState';

interface BasePassState extends BaseState, CanHaveInputPath, CanHaveParameters, CanHaveResultPath, CanHaveOutputPath {
  Type: 'Pass';
  Result?: JSONValue;
}

export type PassState = (IntermediateState | TerminalState) & BasePassState;
