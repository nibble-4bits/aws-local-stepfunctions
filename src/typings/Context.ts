import type { JSONValue } from './JSONValue';

type ContextExecution = {
  Input?: JSONValue;
  StartTime?: string;
  [other: string]: unknown;
};

export type Context = {
  Execution?: ContextExecution;
  [other: string]: unknown;
};
