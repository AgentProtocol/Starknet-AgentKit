import { Runnable, RunnableLike } from "@langchain/core/runnables";
import type { PregelInterface } from "../types.js";
export declare function isPregelLike(x: PregelInterface<any, any> | RunnableLike<any, any, any>): x is PregelInterface<any, any>;
export declare function findSubgraphPregel(candidate: Runnable): PregelInterface<any, any> | undefined;
