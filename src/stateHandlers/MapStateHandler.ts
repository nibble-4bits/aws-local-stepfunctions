import type { MapState } from '../typings/MapState';
import type { JSONValue } from '../typings/JSONValue';
import type { ExecutionResult, MapStateHandlerOptions } from '../typings/StateHandlers';
import { BaseStateHandler } from './BaseStateHandler';
import { StateMachine } from '../StateMachine';
import { jsonPathQuery } from '../JsonPath';
import { processPayloadTemplate } from '../InputOutputProcessing';
import pLimit from 'p-limit';

class MapStateHandler extends BaseStateHandler<MapState> {
  constructor(stateDefinition: MapState) {
    super(stateDefinition);
  }

  private processItem(
    item: JSONValue,
    input: JSONValue,
    context: Record<string, unknown>,
    index: number,
    options: MapStateHandlerOptions | undefined
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
    const mapStateMachine = new StateMachine(state.Iterator, options?.validationOptions);
    return mapStateMachine.run(paramValue ?? item, options?.runOptions);
  }

  override async executeState(
    input: JSONValue,
    context: Record<string, unknown>,
    options?: MapStateHandlerOptions
  ): Promise<ExecutionResult> {
    const state = this.stateDefinition;

    let items = input;
    if (state.ItemsPath) {
      items = jsonPathQuery(state.ItemsPath, input, context);
    }

    if (!Array.isArray(items)) {
      // TODO: throw error instead of returning, because current input is not an array.
      return this.buildExecutionResult([]);
    }

    const DEFAULT_MAX_CONCURRENCY = 40; // If `MaxConcurrency` is 0 or not specified, default to running 40 iterations concurrently
    const limit = pLimit(state.MaxConcurrency || DEFAULT_MAX_CONCURRENCY);
    const processedItemsPromise = items.map((item, i) =>
      limit(() => this.processItem(item, input, context, i, options))
    );
    const result = await Promise.all(processedItemsPromise);

    delete context['Map'];
    return this.buildExecutionResult(result);
  }
}

export { MapStateHandler };
