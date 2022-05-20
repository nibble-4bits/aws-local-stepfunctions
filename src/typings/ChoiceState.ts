import { BaseState } from './BaseState';

interface BaseChoiceState extends BaseState {
  Type: 'Choice';
  InputPath?: string;
  OutputPath?: string;
}

export type ChoiceState = BaseChoiceState;
