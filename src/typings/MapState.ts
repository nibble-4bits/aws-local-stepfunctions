import { BaseState } from './BaseState';
import {
  CanHaveInputPath,
  CanHaveOutputPath,
  CanHaveParameters,
  CanHaveResultPath,
  CanHaveResultSelector,
} from './InputOutputProcessing';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BaseMapState
  extends BaseState,
    CanHaveInputPath,
    CanHaveParameters,
    CanHaveResultSelector,
    CanHaveResultPath,
    CanHaveOutputPath {
  Type: 'Map';
}

export type MapState = (IntermediateState | TerminalState) & BaseMapState;
