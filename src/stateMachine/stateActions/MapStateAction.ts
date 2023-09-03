import type { MapState } from '../../typings/MapState';
import type { JSONValue } from '../../typings/JSONValue';
import type { ExecutionResult, MapStateActionOptions } from '../../typings/StateActions';
import type { Context } from '../../typings/Context';
import type { EventLogger } from '../EventLogger';
import type { EventLog } from '../../typings/EventLogs';
import { BaseStateAction } from './BaseStateAction';
import { StateMachine } from '../StateMachine';
import { jsonPathQuery } from '../JsonPath';
import { processPayloadTemplate } from '../InputOutputProcessing';
import { StatesRuntimeError } from '../../error/predefined/StatesRuntimeError';
import { ExecutionError } from '../../error/ExecutionError';
import pLimit from 'p-limit';

/**
 * Default number of iterations to run concurrently.
 */
const DEFAULT_MAX_CONCURRENCY = 40;

class MapStateAction extends BaseStateAction<MapState> {
  private executionAbortFuncs: (() => void)[];

  constructor(stateDefinition: MapState, stateName: string) {
    super(stateDefinition, stateName);

    this.executionAbortFuncs = [];
  }

  private async forwardEventsToRootEventLogger(
    eventLogger: EventLogger | undefined,
    executionEventLogs: AsyncGenerator<EventLog>,
    index: number,
    parentStateRawInput: JSONValue
  ) {
    if (!eventLogger) return;

    for await (const event of executionEventLogs) {
      eventLogger.forwardNestedMapEvent(event, index, this.stateName, parentStateRawInput);
    }
  }

  private processItem(
    stateMachine: StateMachine,
    item: JSONValue,
    input: JSONValue,
    context: Context,
    index: number,
    options: MapStateActionOptions | undefined
  ): Promise<JSONValue> {
    const state = this.stateDefinition;

    let paramValue;
    context['Map'] = {
      Item: {
        Index: index,
        Value: item,
      },
    };

    // Handle `Parameters` field if specified
    if (state.Parameters) {
      paramValue = processPayloadTemplate(state.Parameters, input, context);
    }

    // Pass the current parameter value if defined, otherwise pass the current item being iterated
    const execution = stateMachine.run(paramValue ?? item, options?.runOptions);

    this.executionAbortFuncs.push(execution.abort);

    // TODO: Find a way to remove this ignore directive and not rely on it
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.forwardEventsToRootEventLogger(options?.eventLogger, execution.eventLogs, index, options?.rawInput);

    return execution.result;
  }

  override async execute(
    input: JSONValue,
    context: Context,
    options?: MapStateActionOptions
  ): Promise<ExecutionResult> {
    const state = this.stateDefinition;

    let items = input;
    if (state.ItemsPath) {
      items = jsonPathQuery(state.ItemsPath, input, context);
    }

    if (!Array.isArray(items)) {
      throw new StatesRuntimeError('Input of Map state must be an array or ItemsPath property must point to an array');
    }

    const iteratorStateMachine = new StateMachine(state.Iterator, {
      ...options?.stateMachineOptions,
      validationOptions: { _noValidate: true },
    });
    const limit = pLimit(state.MaxConcurrency || DEFAULT_MAX_CONCURRENCY);
    const processedItemsPromise = items.map((item, i) =>
      limit(() => this.processItem(iteratorStateMachine, item, input, context, i, options))
    );

    try {
      const result = await Promise.all(processedItemsPromise);

      return this.buildExecutionResult(result);
    } catch (error) {
      this.executionAbortFuncs.forEach((abort) => abort());

      if (error instanceof ExecutionError) {
        throw error.getWrappedError;
      }

      throw error;
    } finally {
      delete context['Map'];
    }
  }
}

export { MapStateAction };
