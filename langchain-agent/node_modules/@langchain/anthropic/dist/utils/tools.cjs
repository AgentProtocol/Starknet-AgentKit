"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleToolChoice = void 0;
function handleToolChoice(toolChoice) {
    if (!toolChoice) {
        return undefined;
    }
    else if (toolChoice === "any") {
        return {
            type: "any",
        };
    }
    else if (toolChoice === "auto") {
        return {
            type: "auto",
        };
    }
    else if (typeof toolChoice === "string") {
        return {
            type: "tool",
            name: toolChoice,
        };
    }
    else {
        return toolChoice;
    }
}
exports.handleToolChoice = handleToolChoice;
