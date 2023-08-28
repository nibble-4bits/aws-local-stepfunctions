import type { Context } from '../../typings/Context';
import type { JSONValue } from '../../typings/JSONValue';
import type { ParallelState } from '../../typings/ParallelState';
import type { ExecutionResult, ParallelStateActionOptions } from '../../typings/StateActions';
import { StateMachine } from '../StateMachine';
import { BaseStateAction } from './BaseStateAction';
import { ExecutionError } from '../../error/ExecutionError';
import pLimit from 'p-limit';

/**
 * Default number of branches to run concurrently.
 */
const DEFAULT_CONCURRENCY = 40;

class ParallelStateAction extends BaseStateAction<ParallelState> {
  private executionAbortFuncs: (() => void)[];

  constructor(stateDefinition: ParallelState) {
    super(stateDefinition);

    this.executionAbortFuncs = [];
  }

  private processBranch(
    branch: (typeof this.stateDefinition.Branches)[number],
    input: JSONValue,
    context: Context,
    options: ParallelStateActionOptions | undefined
  ): Promise<JSONValue> {
    const stateMachine = new StateMachine(branch, {
      ...options?.stateMachineOptions,
      validationOptions: { _noValidate: true },
    });
    const execution = stateMachine.run(input, options?.runOptions);

    this.executionAbortFuncs.push(execution.abort);

    return execution.result;
  }

  override async execute(
    input: JSONValue,
    context: Context,
    options?: ParallelStateActionOptions
  ): Promise<ExecutionResult> {
    const state = this.stateDefinition;

    const limit = pLimit(DEFAULT_CONCURRENCY);
    const processedBranchesPromise = state.Branches.map((branch) =>
      limit(() => this.processBranch(branch, input, context, options))
    );

    try {
      const result = await Promise.all(processedBranchesPromise);

      return this.buildExecutionResult(result);
    } catch (error) {
      this.executionAbortFuncs.forEach((abort) => abort());

      if (error instanceof ExecutionError) {
        throw error.getWrappedError;
      }

      throw error;
    }
  }
}

export { ParallelStateAction };
