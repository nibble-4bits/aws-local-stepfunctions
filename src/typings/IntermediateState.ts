import type { BaseState } from './BaseState';
import type { StateType } from './StateType';

interface NextableState extends BaseState {
  Type: Exclude<StateType, 'Choice' | 'Succeed' | 'Fail'>;
  Next: string;
}

export type IntermediateState = NextableState;
