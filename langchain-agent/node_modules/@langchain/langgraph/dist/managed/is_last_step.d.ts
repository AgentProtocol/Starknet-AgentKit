import { ManagedValue } from "./base.js";
export declare class IsLastStepManager extends ManagedValue<boolean> {
    call(step: number): boolean;
}
