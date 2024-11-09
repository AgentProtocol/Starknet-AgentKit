import * as readline from "readline";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  BOT_TOKEN,
} from "./constants.js";
import { ChatOpenAI } from "@langchain/openai";
import { Telegraf } from "telegraf";
import { message } from "./tg_bot/filters.js";
import { sendEthTool } from "./tools/sendEthTool.js";
import { getNewsTool } from "./tools/getNewsTool.js";
import { getCurrentAccountTool } from "./tools/getCurrentAccountTool.js";
import { generateStarknetAccountTool } from "./tools/generateStarknetAccountTool.js";
import { deployStarknetAccountTool } from "./tools/deployStarknetAccountTool.js";
import { swapTool } from "./tools/swapTool.js";
import { checkBalanceTool } from "./tools/checkBalanceTool.js";
import { sendTokenTool } from "./tools/sendTokenTool.js";

// setup TG bot
if (!BOT_TOKEN) {
  console.error("No private key defined for the TG bot");
  process.exit(1); // Exit the program with error code
}
const bot = new Telegraf(BOT_TOKEN);

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN is not set");
}
bot.start((ctx) => {
  return ctx.reply(`Hello ${ctx.update.message.from.first_name}!`);
});

// Interval ID for background tasks
// Notice: this is just POC, should not be used in prod
let backgroundActionIntervals: Record<string, NodeJS.Timeout | undefined> = {};

// Define the graph state for message history
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});


// Define the tools for the agent to use

// Tool to start a periodic background action
// Takes an action description and interval in seconds
// Creates a new interval that executes the action periodically
// Clears any existing interval before starting new one
const startBackgroundAction = tool(
  async ({ whatToDo, intervalInSeconds }, options) => {
    const chatId = options.metadata.thread_id;

    if (backgroundActionIntervals[chatId]) {
      clearInterval(backgroundActionIntervals[chatId]);
      backgroundActionIntervals[chatId] = undefined;
    }
    const doAction = async () => {
      const message = whatToDo;

      const finalState = await app.invoke(
        { messages: [new HumanMessage(message)] },
        { configurable: { thread_id: Number(chatId) } }
      );
      bot.telegram.sendMessage(chatId,finalState.messages[finalState.messages.length - 1].content)

      // console.log("\n------UPDATE------\n");
      // console.log(finalState.messages[finalState.messages.length - 1].content);
      // console.log("\n-------------------\n");

      // Move the cursor back to the input line
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 1); // Clear the current line
      rl.prompt(); // Show the prompt again
    };
    backgroundActionIntervals[chatId] = await setInterval(
      doAction,
      intervalInSeconds * 1000
    );
    return "Started.";
  },
  {
    name: "start_background_action",
    description:
      "Call to start a loop that executes an action every X seconds. Or stop the current loop and start a new one.",
    schema: z.object({
      whatToDo: z
        .string()
        .describe("The action that you want to execute every X second."),
      intervalInSeconds: z
        .number()
        .describe(
          "The number of seconds that needs to pass before the news are fetched again."
        ),
    }),
  }
);

// Tool to stop the current background action
const stopBackgroundAction = tool(async ({}, options) => {
  const chatId = options.metadata.thread_id;
  if (backgroundActionIntervals[chatId]) {
    clearInterval(backgroundActionIntervals[chatId]);
    backgroundActionIntervals[chatId] = undefined;
  }
  return "Stopped.";
}, {
  name: "stop_background_action",
  description: "Stop the currently running background action loop"
});

// Initialize available tools
const tools = [
  sendEthTool,
  checkBalanceTool,
  startBackgroundAction,
  stopBackgroundAction,
  getNewsTool,
  getCurrentAccountTool,
  generateStarknetAccountTool,
  deployStarknetAccountTool,
  swapTool,
  sendTokenTool
];
const toolNode = new ToolNode(tools);

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).bindTools(tools);

function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
}

async function callModel(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const response = await model.invoke(messages);
  return { messages: [response] };
}

const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

bot.on(message("text"), async (ctx) => {
  if (!ctx.chat.id) return;

  // Indicate to the user that the agent is typing
  await ctx.persistentChatAction("typing", async () => {
    // Process user message and generate AI response
    const finalState = await app.invoke(
      { messages: [new HumanMessage(ctx.message.text)] },
      { configurable: { thread_id: Number(ctx.chat.id) } }
    );
    // Send the response
    ctx.reply(finalState.messages[finalState.messages.length - 1].content);
  });
});

bot.launch();
