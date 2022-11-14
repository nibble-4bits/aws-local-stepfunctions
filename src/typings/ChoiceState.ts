import { BaseState } from './BaseState';
import { CanHaveInputPath, CanHaveOutputPath } from './InputOutputProcessing';

type StringOperatorNames =
  | 'StringEquals'
  | 'StringLessThan'
  | 'StringGreaterThan'
  | 'StringLessThanEquals'
  | 'StringGreaterThanEquals'
  | 'StringMatches';

type StringPathOperatorNames =
  | 'StringEqualsPath'
  | 'StringLessThanPath'
  | 'StringGreaterThanPath'
  | 'StringLessThanEqualsPath'
  | 'StringGreaterThanEqualsPath';

type NumericOperatorNames =
  | 'NumericEquals'
  | 'NumericLessThan'
  | 'NumericGreaterThan'
  | 'NumericLessThanEquals'
  | 'NumericGreaterThanEquals';

type NumericPathOperatorNames =
  | 'NumericEqualsPath'
  | 'NumericLessThanPath'
  | 'NumericGreaterThanPath'
  | 'NumericLessThanEqualsPath'
  | 'NumericGreaterThanEqualsPath';

type BooleanOperatorNames = 'BooleanEquals';

type BooleanPathOperatorNames = 'BooleanEqualsPath';

type TimestampOperatorNames =
  | 'TimestampEquals'
  | 'TimestampLessThan'
  | 'TimestampGreaterThan'
  | 'TimestampLessThanEquals'
  | 'TimestampGreaterThanEquals';

type TimestampPathOperatorNames =
  | 'TimestampEqualsPath'
  | 'TimestampLessThanPath'
  | 'TimestampGreaterThanPath'
  | 'TimestampLessThanEqualsPath'
  | 'TimestampGreaterThanEqualsPath';

type TypeTestOperatorNames = 'IsNull' | 'IsPresent' | 'IsNumeric' | 'IsString' | 'IsBoolean' | 'IsTimestamp';

type StringComparisonOperator = {
  [P in StringOperatorNames]?: string;
};

type StringPathComparisonOperator = {
  [P in StringPathOperatorNames]?: string;
};

type NumericComparisonOperator = {
  [P in NumericOperatorNames]?: number;
};

type NumericPathComparisonOperator = {
  [P in NumericPathOperatorNames]?: string;
};

type BooleanComparisonOperator = {
  [P in BooleanOperatorNames]?: boolean;
};

type BooleanPathComparisonOperator = {
  [P in BooleanPathOperatorNames]?: string;
};

type TimestampComparisonOperator = {
  [P in TimestampOperatorNames]?: string;
};

type TimestampPathComparisonOperator = {
  [P in TimestampPathOperatorNames]?: string;
};

type TypeTestComparisonOperator = {
  [P in TypeTestOperatorNames]?: boolean;
};

type ComparisonOperator =
  | StringComparisonOperator
  | StringPathComparisonOperator
  | NumericComparisonOperator
  | NumericPathComparisonOperator
  | BooleanComparisonOperator
  | BooleanPathComparisonOperator
  | TimestampComparisonOperator
  | TimestampPathComparisonOperator
  | TypeTestComparisonOperator;

type BaseDataTestExpression = {
  Variable: string;
};

type DataTestExpression = BaseDataTestExpression & ComparisonOperator;

type BooleanExpression = {
  And?: ChoiceRuleWithoutNext[];
  Or?: ChoiceRuleWithoutNext[];
  Not?: ChoiceRuleWithoutNext;
};

export type ChoiceRuleWithoutNext = DataTestExpression | BooleanExpression;

export type ChoiceRule = (DataTestExpression | BooleanExpression) & { Next: string };

interface BaseChoiceState extends BaseState, CanHaveInputPath, CanHaveOutputPath {
  Type: 'Choice';
  Choices: ChoiceRule[];
  Default?: string;
}

export type ChoiceState = BaseChoiceState;
