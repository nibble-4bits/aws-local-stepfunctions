import type { Context } from '../../typings/Context';
import type { JSONValue } from '../../typings/JSONValue';
import type { ParallelState } from '../../typings/ParallelState';
import type { ExecutionResult, ParallelStateActionOptions } from '../../typings/StateActions';
import type { EventLogger } from '../EventLogger';
import type { EventLog, ParallelBranchEvent, ParallelBranchFailedEvent } from '../../typings/EventLogs';
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

  constructor(stateDefinition: ParallelState, stateName: string) {
    super(stateDefinition, stateName);

    this.executionAbortFuncs = [];
  }

  private async forwardEventsToRootEventLogger(
    eventLogger: EventLogger | undefined,
    executionEventLogs: AsyncGenerator<EventLog>,
    parentStateRawInput: JSONValue
  ) {
    if (!eventLogger) {
      return;
    }

    for await (const event of executionEventLogs) {
      const parallelEvent = event as ParallelBranchEvent | ParallelBranchFailedEvent;

      if (event.type === 'ExecutionStarted') {
        parallelEvent.type = 'ParallelBranchStarted';
        parallelEvent.parentState = { name: this.stateName, type: 'Parallel', input: parentStateRawInput };
      } else if (event.type === 'ExecutionSucceeded') {
        parallelEvent.type = 'ParallelBranchSucceeded';
        parallelEvent.parentState = { name: this.stateName, type: 'Parallel', input: parentStateRawInput };
      } else if (event.type === 'ExecutionFailed') {
        parallelEvent.type = 'ParallelBranchFailed';
        parallelEvent.parentState = { name: this.stateName, type: 'Parallel', input: parentStateRawInput };
      } else if (event.type === 'ExecutionAborted' || event.type === 'ExecutionTimeout') {
        continue;
      }

      eventLogger.forwardNestedEvent(parallelEvent);
    }
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

    // TODO: Find a way to remove this ignore directive and not rely on it
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.forwardEventsToRootEventLogger(options?.eventLogger, execution.eventLogs, options?.rawInput);

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
