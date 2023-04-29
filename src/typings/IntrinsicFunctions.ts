export type IntrinsicFunctionName =
  | 'States.Format'
  | 'States.StringToJson'
  | 'States.JsonToString'
  | 'States.Array'
  | 'States.ArrayPartition'
  | 'States.ArrayContains'
  | 'States.ArrayRange'
  | 'States.ArrayGetItem'
  | 'States.ArrayLength'
  | 'States.ArrayUnique'
  | 'States.Base64Encode'
  | 'States.Base64Decode'
  | 'States.Hash'
  | 'States.JsonMerge'
  | 'States.MathRandom'
  | 'States.MathAdd'
  | 'States.StringSplit'
  | 'States.UUID';

export type HashingAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
