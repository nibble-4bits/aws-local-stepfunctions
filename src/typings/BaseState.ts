import { StateType } from './StateType';

export interface BaseState {
  Type: StateType;
  Comment?: string;
}
