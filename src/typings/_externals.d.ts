declare module 'asl-validator' {
  interface ValidationOptions {
    readonly checkPaths: boolean;
    readonly checkArn: boolean;
  }

  function aslValidator(
    aslDefinition: object,
    opts?: ValidationOptions
  ): {
    isValid: boolean;
    errors: object[];
    errorsText: (separator?: string) => string;
  };

  export = aslValidator;
}
