import { BaseState } from './BaseState';
import {
  CanHaveInputPath,
  CanHaveOutputPath,
  CanHaveParameters,
  CanHaveResultPath,
  CanHaveResultSelector,
} from './InputOutputProcessing';
import { IntermediateState } from './IntermediateState';
import { StateMachineDefinition } from './StateMachineDefinition';
import { TerminalState } from './TerminalState';

interface BaseMapState
  extends BaseState,
    CanHaveInputPath,
    CanHaveParameters,
    CanHaveResultSelector,
    CanHaveResultPath,
    CanHaveOutputPath {
  Type: 'Map';
  Iterator: Omit<StateMachineDefinition, 'Version' | 'TimeoutSeconds'>;
  ItemsPath?: string;
  MaxConcurrency?: number;
}

export type MapState = (IntermediateState | TerminalState) & BaseMapState;
