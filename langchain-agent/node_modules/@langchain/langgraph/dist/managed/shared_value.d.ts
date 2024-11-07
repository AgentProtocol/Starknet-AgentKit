import { RunnableConfig } from "@langchain/core/runnables";
import { BaseStore } from "@langchain/langgraph-checkpoint";
import { ConfiguredManagedValue, ManagedValue, ManagedValueParams, WritableManagedValue } from "./base.js";
import { LangGraphRunnableConfig } from "../pregel/runnable_types.js";
type Value = Record<string, Record<string, any>>;
type Update = Record<string, Record<string, any> | null>;
export interface SharedValueParams extends ManagedValueParams {
    scope: string;
    key: string;
}
export declare class SharedValue extends WritableManagedValue<Value, Update> {
    scope: string;
    store: BaseStore | null;
    ns: ["scoped", string, string, any] | null;
    value: Value;
    constructor(config: LangGraphRunnableConfig, params: SharedValueParams);
    static initialize<Value = any>(config: RunnableConfig, args: SharedValueParams): Promise<ManagedValue<Value>>;
    static on(scope: string): ConfiguredManagedValue<Value>;
    call(_step: number): Value;
    private processUpdate;
    update(values: Update[]): Promise<void>;
    private loadStore;
}
export {};
