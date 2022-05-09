import { BaseState } from './BaseState';
import { IntermediateState } from './IntermediateState';
import { TerminalState } from './TerminalState';

interface BaseMapState extends BaseState {
  Type: 'Map';
  InputPath?: string;
  OutputPath?: string;
  ResultPath?: string;
  Parameters?: Record<string, unknown>;
  ResultSelector?: string;
}

export type MapState = (IntermediateState | TerminalState) & BaseMapState;
