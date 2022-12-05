import type { AllStates } from './AllStates';

export interface StateMachineDefinition {
  States: Record<string, AllStates>;
  StartAt: string;
  Comment?: string;
  Version?: string;
  TimeoutSeconds?: number;
}
