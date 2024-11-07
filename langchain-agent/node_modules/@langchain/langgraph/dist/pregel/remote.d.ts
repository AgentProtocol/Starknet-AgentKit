import { Client, type Checkpoint, type ThreadState } from "@langchain/langgraph-sdk";
import { Graph as DrawableGraph, Node as DrawableNode } from "@langchain/core/runnables/graph";
import { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { All, CheckpointListOptions } from "@langchain/langgraph-checkpoint";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { BaseChannel, LangGraphRunnableConfig, ManagedValueSpec } from "../web.js";
import { StrRecord } from "./algo.js";
import { PregelInputType, PregelOptions, PregelOutputType } from "./index.js";
import { PregelNode } from "./read.js";
import { PregelParams, PregelInterface, StateSnapshot } from "./types.js";
export type RemoteGraphParams = Omit<PregelParams<StrRecord<string, PregelNode>, StrRecord<string, BaseChannel | ManagedValueSpec>>, "channels" | "nodes" | "inputChannels" | "outputChannels"> & {
    graphId: string;
    client?: Client;
    url?: string;
    apiKey?: string;
    headers?: Record<string, string>;
};
/**
 * The `RemoteGraph` class is a client implementation for calling remote
 * APIs that implement the LangGraph Server API specification.
 *
 * For example, the `RemoteGraph` class can be used to call APIs from deployments
 * on LangGraph Cloud.
 *
 * `RemoteGraph` behaves the same way as a `StateGraph` and can be used directly as
 * a node in another `StateGraph`.
 *
 * @example
 * ```ts
 * import { RemoteGraph } from "@langchain/langgraph/remote";
 *
 * // Can also pass a LangGraph SDK client instance directly
 * const remoteGraph = new RemoteGraph({
 *   graphId: process.env.LANGGRAPH_REMOTE_GRAPH_ID!,
 *   apiKey: process.env.LANGGRAPH_REMOTE_GRAPH_API_KEY,
 *   url: process.env.LANGGRAPH_REMOTE_GRAPH_API_URL,
 * });
 *
 * const input = {
 *   messages: [
 *     {
 *       role: "human",
 *       content: "Hello world!",
 *     },
 *   ],
 * };
 *
 * const config = {
 *   configurable: { thread_id: "threadId1" },
 * };
 *
 * await remoteGraph.invoke(input, config);
 * ```
 */
export declare class RemoteGraph<Nn extends StrRecord<string, PregelNode> = StrRecord<string, PregelNode>, Cc extends StrRecord<string, BaseChannel | ManagedValueSpec> = StrRecord<string, BaseChannel | ManagedValueSpec>, ConfigurableFieldType extends Record<string, any> = StrRecord<string, any>> extends Runnable<PregelInputType, PregelOutputType, PregelOptions<Nn, Cc, ConfigurableFieldType>> implements PregelInterface<Nn, Cc, ConfigurableFieldType> {
    static lc_name(): string;
    lc_namespace: string[];
    lg_is_pregel: boolean;
    config?: RunnableConfig;
    graphId: string;
    protected client: Client;
    protected interruptBefore?: Array<keyof Nn> | All;
    protected interruptAfter?: Array<keyof Nn> | All;
    constructor(params: RemoteGraphParams);
    withConfig(config: RunnableConfig): typeof this;
    protected _sanitizeConfig(config: RunnableConfig): {
        tags: any;
        metadata: any;
        configurable: {
            [k: string]: unknown;
        };
    };
    protected _getConfig(checkpoint: Record<string, unknown>): RunnableConfig;
    protected _getCheckpoint(config?: RunnableConfig): Checkpoint | undefined;
    protected _createStateSnapshot(state: ThreadState): StateSnapshot;
    invoke(input: PregelInputType, options?: Partial<PregelOptions<Nn, Cc, ConfigurableFieldType>>): Promise<PregelOutputType>;
    streamEvents(input: PregelInputType, options: Partial<PregelOptions<Nn, Cc, ConfigurableFieldType>> & {
        version: "v1" | "v2";
    }): IterableReadableStream<StreamEvent>;
    streamEvents(input: PregelInputType, options: Partial<PregelOptions<Nn, Cc, ConfigurableFieldType>> & {
        version: "v1" | "v2";
        encoding: never;
    }): IterableReadableStream<never>;
    _streamIterator(input: PregelInputType, options?: Partial<PregelOptions<Nn, Cc, ConfigurableFieldType>>): AsyncGenerator<PregelOutputType>;
    updateState(inputConfig: LangGraphRunnableConfig, values: Record<string, unknown>, asNode?: string): Promise<RunnableConfig>;
    getStateHistory(config: RunnableConfig, options?: CheckpointListOptions): AsyncIterableIterator<StateSnapshot>;
    protected _getDrawableNodes(nodes: Array<{
        id: string | number;
        name?: string;
        data?: Record<string, any> | string;
        metadata?: unknown;
    }>): Record<string, DrawableNode>;
    getState(config: RunnableConfig, options?: {
        subgraphs?: boolean;
    }): Promise<StateSnapshot>;
    /** @deprecated Use getGraphAsync instead. The async method will become the default in the next minor release. */
    getGraph(_?: RunnableConfig & {
        xray?: boolean | number;
    }): DrawableGraph;
    /**
     * Returns a drawable representation of the computation graph.
     */
    getGraphAsync(config?: RunnableConfig & {
        xray?: boolean | number;
    }): Promise<DrawableGraph>;
    /** @deprecated Use getSubgraphsAsync instead. The async method will become the default in the next minor release. */
    getSubgraphs(): Generator<[
        string,
        PregelInterface<Nn, Cc, ConfigurableFieldType>
    ]>;
    getSubgraphsAsync(namespace?: string, recurse?: boolean): AsyncGenerator<[string, PregelInterface<Nn, Cc, ConfigurableFieldType>]>;
}
