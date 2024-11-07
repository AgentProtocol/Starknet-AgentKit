import type { MessageCreateParams } from "@anthropic-ai/sdk/resources/index.mjs";
import { AnthropicToolChoice } from "../types.js";
export declare function handleToolChoice(toolChoice?: AnthropicToolChoice): MessageCreateParams.ToolChoiceAuto | MessageCreateParams.ToolChoiceAny | MessageCreateParams.ToolChoiceTool | undefined;
