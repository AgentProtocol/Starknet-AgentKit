"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateKeys = exports.validateGraph = exports.GraphValidationError = void 0;
const constants_js_1 = require("../constants.cjs");
const read_js_1 = require("./read.cjs");
class GraphValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "GraphValidationError";
    }
}
exports.GraphValidationError = GraphValidationError;
function validateGraph({ nodes, channels, inputChannels, outputChannels, streamChannels, interruptAfterNodes, interruptBeforeNodes, }) {
    if (!channels) {
        throw new GraphValidationError("Channels not provided");
    }
    const subscribedChannels = new Set();
    const allOutputChannels = new Set();
    for (const [name, node] of Object.entries(nodes)) {
        if (name === constants_js_1.INTERRUPT) {
            throw new GraphValidationError(`"Node name ${constants_js_1.INTERRUPT} is reserved"`);
        }
        if (node.constructor === read_js_1.PregelNode) {
            node.triggers.forEach((trigger) => subscribedChannels.add(trigger));
        }
        else {
            throw new GraphValidationError(`Invalid node type ${typeof node}, expected PregelNode`);
        }
    }
    // side effect: update channels
    for (const chan of subscribedChannels) {
        if (!(chan in channels)) {
            throw new GraphValidationError(`Subcribed channel '${String(chan)}' not in channels`);
        }
    }
    if (!Array.isArray(inputChannels)) {
        if (!subscribedChannels.has(inputChannels)) {
            throw new GraphValidationError(`Input channel ${String(inputChannels)} is not subscribed to by any node`);
        }
    }
    else {
        if (inputChannels.every((channel) => !subscribedChannels.has(channel))) {
            throw new GraphValidationError(`None of the input channels ${inputChannels} are subscribed to by any node`);
        }
    }
    if (!Array.isArray(outputChannels)) {
        allOutputChannels.add(outputChannels);
    }
    else {
        outputChannels.forEach((chan) => allOutputChannels.add(chan));
    }
    if (streamChannels && !Array.isArray(streamChannels)) {
        allOutputChannels.add(streamChannels);
    }
    else if (Array.isArray(streamChannels)) {
        streamChannels.forEach((chan) => allOutputChannels.add(chan));
    }
    for (const chan of allOutputChannels) {
        if (!(chan in channels)) {
            throw new GraphValidationError(`Output channel '${String(chan)}' not in channels`);
        }
    }
    // validate interrupt before/after
    if (interruptAfterNodes && interruptAfterNodes !== "*") {
        for (const node of interruptAfterNodes) {
            if (!(node in nodes)) {
                throw new GraphValidationError(`Node ${String(node)} not in nodes`);
            }
        }
    }
    if (interruptBeforeNodes && interruptBeforeNodes !== "*") {
        for (const node of interruptBeforeNodes) {
            if (!(node in nodes)) {
                throw new GraphValidationError(`Node ${String(node)} not in nodes`);
            }
        }
    }
}
exports.validateGraph = validateGraph;
function validateKeys(keys, channels) {
    if (Array.isArray(keys)) {
        for (const key of keys) {
            if (!(key in channels)) {
                throw new Error(`Key ${String(key)} not found in channels`);
            }
        }
    }
    else {
        if (!(keys in channels)) {
            throw new Error(`Key ${String(keys)} not found in channels`);
        }
    }
}
exports.validateKeys = validateKeys;
