import { BaseState } from './BaseState';
import { StateType } from './StateType';

interface EndableState extends BaseState {
  Type: Exclude<StateType, 'Choice' | 'Succeed' | 'Fail'>;
  End: true;
}

interface SucceedOrFailState extends BaseState {
  Type: Extract<StateType, 'Succeed' | 'Fail'>;
}

export type TerminalState = EndableState | SucceedOrFailState;
