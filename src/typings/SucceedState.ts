import { BaseState } from './BaseState';
import { CanHaveInputPath, CanHaveOutputPath } from './InputOutputProcessing';
import { TerminalState } from './TerminalState';

interface BaseSucceedState extends BaseState, CanHaveInputPath, CanHaveOutputPath {
  Type: 'Succeed';
}

export type SucceedState = TerminalState & BaseSucceedState;
