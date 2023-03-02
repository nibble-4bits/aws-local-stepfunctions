import type { BaseState } from './BaseState';
import type { CatchableState, RetryableState } from './ErrorHandling';
import type {
  CanHaveInputPath,
  CanHaveOutputPath,
  CanHaveParameters,
  CanHaveResultPath,
  CanHaveResultSelector,
} from './InputOutputProcessing';
import type { IntermediateState } from './IntermediateState';
import type { StateMachineDefinition } from './StateMachineDefinition';
import type { TerminalState } from './TerminalState';

interface BaseMapState
  extends BaseState,
    CanHaveInputPath,
    CanHaveParameters,
    CanHaveResultSelector,
    CanHaveResultPath,
    CanHaveOutputPath,
    RetryableState,
    CatchableState {
  Type: 'Map';
  Iterator: Omit<StateMachineDefinition, 'Version' | 'TimeoutSeconds'>;
  ItemsPath?: string;
  MaxConcurrency?: number;
}

export type MapState = (IntermediateState | TerminalState) & BaseMapState;
