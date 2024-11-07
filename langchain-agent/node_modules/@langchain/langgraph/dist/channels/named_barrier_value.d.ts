import { BaseChannel } from "./base.js";
export declare const areSetsEqual: <T>(a: Set<T>, b: Set<T>) => boolean;
/**
 * A channel that waits until all named values are received before making the value available.
 *
 * This ensures that if node N and node M both write to channel C, the value of C will not be updated
 * until N and M have completed updating.
 * @internal
 */
export declare class NamedBarrierValue<Value> extends BaseChannel<void, Value, Value[]> {
    lc_graph_name: string;
    names: Set<Value>;
    seen: Set<Value>;
    constructor(names: Set<Value>);
    fromCheckpoint(checkpoint?: Value[]): this;
    update(values: Value[]): boolean;
    get(): void;
    checkpoint(): Value[];
    consume(): boolean;
}
