import type { BaseState } from './BaseState';
import type { CatchableState, RetryableState } from './ErrorHandling';
import type {
  CanHaveInputPath,
  CanHaveOutputPath,
  CanHaveResultPath,
  CanHaveResultSelector,
  PayloadTemplate,
} from './InputOutputProcessing';
import type { IntermediateState } from './IntermediateState';
import type { StateMachineDefinition } from './StateMachineDefinition';
import type { TerminalState } from './TerminalState';

interface BaseMapState
  extends BaseState,
    CanHaveInputPath,
    CanHaveResultSelector,
    CanHaveResultPath,
    CanHaveOutputPath,
    RetryableState,
    CatchableState {
  Type: 'Map';
  Iterator?: Omit<StateMachineDefinition, 'Version' | 'TimeoutSeconds'>; // deprecated but still supported, superseded by `ItemProcessor`
  ItemProcessor?: Omit<StateMachineDefinition, 'Version' | 'TimeoutSeconds'>;
  Parameters?: PayloadTemplate; // deprecated but still supported, superseded by `ItemSelector`
  ItemSelector?: PayloadTemplate;
  ItemsPath?: string;
  MaxConcurrency?: number;
  MaxConcurrencyPath?: string;
}

export type MapState = (IntermediateState | TerminalState) & BaseMapState;
