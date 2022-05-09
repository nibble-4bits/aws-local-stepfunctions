import { BaseState } from './BaseState';
import { IntermediateState } from './IntermediateState';

interface BaseChoiceState extends BaseState {
  Type: 'Choice';
  InputPath?: string;
  OutputPath?: string;
}

export type ChoiceState = IntermediateState & BaseChoiceState;
