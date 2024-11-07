import { SerializerProtocol } from "./base.js";
export declare class JsonPlusSerializer implements SerializerProtocol {
    protected _dumps(obj: any): Uint8Array;
    dumpsTyped(obj: any): [string, Uint8Array];
    protected _loads(data: string): Promise<any>;
    loadsTyped(type: string, data: Uint8Array | string): Promise<any>;
}
