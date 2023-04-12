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

interface BaseParallelState
  extends BaseState,
    CanHaveInputPath,
    CanHaveParameters,
    CanHaveResultSelector,
    CanHaveResultPath,
    CanHaveOutputPath,
    RetryableState,
    CatchableState {
  Type: 'Parallel';
  Branches: Omit<StateMachineDefinition, 'Version' | 'TimeoutSeconds'>[];
}

export type ParallelState = (IntermediateState | TerminalState) & BaseParallelState;
