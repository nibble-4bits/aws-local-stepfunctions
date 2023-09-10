export class ErrorWithCause extends Error {
  #errorCause: unknown;

  constructor(message: string, options?: { cause: unknown }) {
    super(message);
    this.#errorCause = options?.cause;
  }

  public get cause(): unknown {
    return this.#errorCause;
  }
}
