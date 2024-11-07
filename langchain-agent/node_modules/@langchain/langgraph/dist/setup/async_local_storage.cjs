"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAsyncLocalStorageSingleton = void 0;
const singletons_1 = require("@langchain/core/singletons");
const node_async_hooks_1 = require("node:async_hooks");
function initializeAsyncLocalStorageSingleton() {
    singletons_1.AsyncLocalStorageProviderSingleton.initializeGlobalInstance(new node_async_hooks_1.AsyncLocalStorage());
}
exports.initializeAsyncLocalStorageSingleton = initializeAsyncLocalStorageSingleton;
