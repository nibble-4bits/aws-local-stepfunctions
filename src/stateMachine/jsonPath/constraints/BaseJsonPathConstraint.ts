export abstract class BaseJSONPathConstraint {
  protected pathExpression: string;

  constructor(pathExpression: string) {
    this.pathExpression = pathExpression;
  }

  abstract test(value: unknown): void;
}
