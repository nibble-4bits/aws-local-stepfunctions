import { BaseState } from './BaseState';
import { StateType } from './StateType';

interface NextableState extends BaseState {
  Type: Exclude<StateType, 'Choice' | 'Succeed' | 'Fail'>;
  Next: string;
  End: never;
}

export type IntermediateState = NextableState;
