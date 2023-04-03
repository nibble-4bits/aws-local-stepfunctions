import type { MapState } from '../../typings/MapState';
import type { JSONValue } from '../../typings/JSONValue';
import type { ExecutionResult, MapStateActionOptions } from '../../typings/StateActions';
import { BaseStateAction } from './BaseStateAction';
import { StateMachine } from '../StateMachine';
import { jsonPathQuery } from '../JsonPath';
import { processPayloadTemplate } from '../InputOutputProcessing';
import { StatesRuntimeError } from '../../error/StatesRuntimeError';
import pLimit from 'p-limit';

class MapStateAction extends BaseStateAction<MapState> {
  constructor(stateDefinition: MapState) {
    super(stateDefinition);
  }

  private processItem(
    item: JSONValue,
    input: JSONValue,
    context: Record<string, unknown>,
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
    const mapStateMachine = new StateMachine(state.Iterator, options?.validationOptions);
    const { result } = mapStateMachine.run(paramValue ?? item, options?.runOptions);
    return result;
  }

  override async execute(
    input: JSONValue,
    context: Record<string, unknown>,
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

export { MapStateAction };
