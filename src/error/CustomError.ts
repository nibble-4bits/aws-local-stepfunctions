export abstract class CustomError extends Error {
  constructor(message?: string) {
    super(message);
  }

  abstract override toString(): string;
}
