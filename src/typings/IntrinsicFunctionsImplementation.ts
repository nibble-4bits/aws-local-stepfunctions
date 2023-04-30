export type ArgumentConstraint = 'ZERO' | 'POSITIVE_INTEGER' | 'NEGATIVE_INTEGER' | 'INTEGER';

export type ArgumentType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' | 'any';

export interface ArgumentDefinition {
  allowedTypes: ArgumentType[];
  constraints?: ArgumentConstraint[];
}

export interface IntrinsicFunctionDefinition {
  name: string;
  arguments?: ArgumentDefinition[];
  variadicArguments?: ArgumentDefinition;
  minArgs?: number;
  maxArgs?: number;
  exactArgs?: number;
}
