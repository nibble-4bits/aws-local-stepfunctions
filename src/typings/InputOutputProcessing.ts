import type { JSONArray, JSONObject, JSONValue } from './JSONValue';

export type PayloadTemplate = JSONObject | JSONArray;

export interface CanHaveInputPath {
  InputPath?: string | null;
}

export interface CanHaveParameters {
  Parameters?: JSONValue;
}

export interface CanHaveResultSelector {
  ResultSelector?: JSONValue;
}

export interface CanHaveResultPath {
  ResultPath?: string | null;
}

export interface CanHaveOutputPath {
  OutputPath?: string | null;
}
