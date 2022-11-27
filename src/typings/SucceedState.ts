import type { BaseState } from './BaseState';
import type { CanHaveInputPath, CanHaveOutputPath } from './InputOutputProcessing';
import type { TerminalState } from './TerminalState';

interface BaseSucceedState extends BaseState, CanHaveInputPath, CanHaveOutputPath {
  Type: 'Succeed';
}

export type SucceedState = TerminalState & BaseSucceedState;
