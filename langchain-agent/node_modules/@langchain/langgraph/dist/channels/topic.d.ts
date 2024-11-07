import { BaseChannel } from "./base.js";
/**
 * @internal
 */
export declare class Topic<Value> extends BaseChannel<Array<Value>, Value | Value[], [
    Value[],
    Value[]
]> {
    lc_graph_name: string;
    unique: boolean;
    accumulate: boolean;
    seen: Set<Value>;
    values: Value[];
    constructor(fields?: {
        unique?: boolean;
        accumulate?: boolean;
    });
    fromCheckpoint(checkpoint?: [Value[], Value[]]): this;
    update(values: Array<Value | Value[]>): boolean;
    get(): Array<Value>;
    checkpoint(): [Value[], Value[]];
}
