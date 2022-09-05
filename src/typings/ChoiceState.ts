import { BaseState } from './BaseState';
import { CanHaveInputPath, CanHaveOutputPath } from './InputOutputProcessing';

interface BaseChoiceState extends BaseState, CanHaveInputPath, CanHaveOutputPath {
  Type: 'Choice';
}

export type ChoiceState = BaseChoiceState;
