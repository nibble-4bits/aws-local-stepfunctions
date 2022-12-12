declare module 'asl-validator' {
  function aslValidator(aslDefinition: object): {
    isValid: boolean;
    errors: object;
    errorsText: (separator: string) => string;
  };

  export = aslValidator;
}
