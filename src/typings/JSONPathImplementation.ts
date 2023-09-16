import type { BaseJSONPathConstraint } from '../stateMachine/jsonPath/constraints/BaseJsonPathConstraint';

export interface JSONPathQueryOptions {
  constraints?: (new (...params: ConstructorParameters<typeof BaseJSONPathConstraint>) => BaseJSONPathConstraint)[];
  ignoreDefinedValueConstraint?: boolean;
}
