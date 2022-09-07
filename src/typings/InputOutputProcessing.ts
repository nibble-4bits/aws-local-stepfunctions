export type PayloadTemplate = object;

export interface CanHaveInputPath {
  InputPath?: string | null;
}

export interface CanHaveParameters {
  Parameters?: PayloadTemplate;
}

export interface CanHaveResultSelector {
  ResultSelector?: PayloadTemplate;
}

export interface CanHaveResultPath {
  ResultPath?: string | null;
}

export interface CanHaveOutputPath {
  OutputPath?: string | null;
}
