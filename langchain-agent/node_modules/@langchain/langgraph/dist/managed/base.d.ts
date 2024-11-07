import { RunnableConfig } from "@langchain/core/runnables";
export interface ManagedValueParams extends Record<string, any> {
}
export declare abstract class ManagedValue<Value = any> {
    runtime: boolean;
    config: RunnableConfig;
    private _promises;
    lg_is_managed_value: boolean;
    constructor(config: RunnableConfig, _params?: ManagedValueParams);
    static initialize<Value = any>(_config: RunnableConfig, _args?: any): Promise<ManagedValue<Value>>;
    abstract call(step: number): Value;
    promises(): Promise<unknown>;
    protected addPromise(promise: Promise<unknown>): void;
}
export declare abstract class WritableManagedValue<Value = any, Update = any> extends ManagedValue<Value> {
    abstract update(writes: Update[]): Promise<void>;
}
export declare const ChannelKeyPlaceholder = "__channel_key_placeholder__";
export type ManagedValueSpec = typeof ManagedValue | ConfiguredManagedValue;
export interface ConfiguredManagedValue<Value = any> {
    cls: typeof ManagedValue<Value>;
    params: ManagedValueParams;
}
export declare class ManagedValueMapping extends Map<string, ManagedValue<any>> {
    constructor(entries?: Iterable<[string, ManagedValue<any>]> | null);
    replaceRuntimeValues(step: number, values: Record<string, any> | any): void;
    replaceRuntimePlaceholders(step: number, values: Record<string, any> | any): void;
}
export declare function isManagedValue(value: unknown): value is typeof ManagedValue;
export declare function isConfiguredManagedValue(value: unknown): value is ConfiguredManagedValue;
/**
 * No-op class used when getting state values, as managed values should never be returned
 * in get state calls.
 */
export declare class NoopManagedValue extends ManagedValue {
    call(): void;
    static initialize(config: RunnableConfig, _args?: any): Promise<ManagedValue>;
}
