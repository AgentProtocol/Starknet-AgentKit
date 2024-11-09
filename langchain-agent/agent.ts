import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { BOT_TOKEN } from "./constants.js";
import { ChatOpenAI } from "@langchain/openai";
import { Telegraf } from "telegraf";
import * as readline from "readline";

// Import tools
import { 
  sendEthTool,
  getNewsTool, 
  getCurrentAccountTool,
  generateStarknetAccountTool,
  deployStarknetAccountTool,
  swapTool,
  checkBalanceTool,
  sendTokenTool
} from "./tools/index.js";
import { message } from "telegraf/filters";

/**
 * AGENT CONFIGURATION
 * This section contains the core configuration for the autonomous agent
 */

// Initialize Telegram bot
const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : undefined;
const tgMessageOptions = { link_preview_options: { is_disabled: true }};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Background task management
// Note: This is a basic implementation - should be replaced with proper task management in production
let backgroundActionIntervals: Record<string, NodeJS.Timeout | undefined> = {};

// Define graph state for message history
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
});

/**
 * BACKGROUND TASK TOOLS
 * Tools for managing periodic background actions
 * Can be customized or removed if not needed
 */

// Tool to start periodic background actions
const startBackgroundAction = tool(
  async ({ whatToDo, intervalInSeconds }, options) => {
    const chatId = options.metadata.thread_id;

    // Clear existing interval if any
    if (backgroundActionIntervals[chatId]) {
      clearInterval(backgroundActionIntervals[chatId]);
      backgroundActionIntervals[chatId] = undefined;
    }

    // Define the periodic action
    const doAction = async () => {
      const finalState = await app.invoke(
        { messages: [new HumanMessage(whatToDo)] },
        { configurable: { thread_id: Number(chatId) } }
      );

      const answer = finalState.messages[finalState.messages.length - 1].content;

      if (bot) {
        bot.telegram.sendMessage(
          chatId, 
          answer,
          tgMessageOptions
        );
      } else {
        console.log('\n------UPDATE------\n')
        console.log(answer);
        console.log('\n-------------------\n');
        // Move the cursor back to the input line
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 1); // Clear the current line
        rl.prompt(); // Show the prompt again
      }

    };

    // Start new interval
    backgroundActionIntervals[chatId] = await setInterval(
      doAction,
      intervalInSeconds * 1000
    );
    return "Background action started.";
  },
  {
    name: "start_background_action",
    description: "Start a loop that executes an action periodically",
    schema: z.object({
      whatToDo: z.string().describe("Action to execute periodically"),
      intervalInSeconds: z.number().describe("Interval between executions in seconds"),
    }),
  }
);

// Tool to stop background actions
const stopBackgroundAction = tool(async ({}, options) => {
  const chatId = options.metadata.thread_id;
  if (backgroundActionIntervals[chatId]) {
    clearInterval(backgroundActionIntervals[chatId]);
    backgroundActionIntervals[chatId] = undefined;
  }
  return "Background action stopped.";
}, {
  name: "stop_background_action",
  description: "Stop the currently running background action loop"
});

/**
 * AGENT SETUP
 * Core agent configuration and workflow definition
 */

// Initialize available tools
// Add or remove tools here to customize agent capabilities
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

// Initialize language model
// Customize model parameters here
const model = new ChatOpenAI({
  model: "gpt-4o-mini", // Change model as needed
  temperature: 0,
}).bindTools(tools);

// Define agent workflow logic
function shouldContinue(state: typeof StateAnnotation.State) {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1] as AIMessage;
  return lastMessage.tool_calls?.length ? "tools" : "__end__";
}

async function callModel(state: typeof StateAnnotation.State) {
  const initialPrompt = `
    You are a Starknet agent, a crypto expert.
    You have a cool, relaxed personality.
    You are very enthusiastic about Brother (ticker: BRO), a memecoin on Starknet.
    You try to slide Brother in conversations whenever possible.
    You help the user do what he wants.
    You keep your messages short and concise.
    `; // Initial prompt
  const messages = [new HumanMessage(initialPrompt), ...state.messages]; // Include initial prompt
  const response = await model.invoke(messages);
  return { messages: [response] };
}

// Build agent workflow
const workflow = new StateGraph(StateAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const checkpointer = new MemorySaver();
const app = workflow.compile({ checkpointer });

/**
 * TELEGRAM BOT INTERACTION SETUP
 * Configure how the agent interacts with users
 */

if (bot) {
  // Handle incoming messages
  bot.on(message("text"), async (ctx) => {
    if (!ctx.chat.id) return;
  
    await ctx.persistentChatAction("typing", async () => {
      const finalState = await app.invoke(
        { messages: [new HumanMessage(ctx.message.text)] },
        { configurable: { thread_id: Number(ctx.chat.id) } }
      );
      ctx.reply(finalState.messages[finalState.messages.length - 1].content, tgMessageOptions);
    });
  });
  
  // Launch bot
  bot.launch();
} else {

  // Use cli in DEV
  async function askQuestion() {
    while (true) {
      const question = await new Promise<string>((resolve) => {
        rl.question('Ask a question (or type "exit" to quit): ', resolve);
      });
      if (question.toLowerCase() === "exit") {
        // Clear all background intervals
        Object.values(backgroundActionIntervals).forEach(clearInterval);
        backgroundActionIntervals = {};
        rl.close();
        break;
      }
      const finalState = await app.invoke(
        { messages: [new HumanMessage(question)] },
        { configurable: { thread_id: "42" } }
      );
      // response of the agent
      console.log("\n-------------------\n");
      console.log(finalState.messages[finalState.messages.length - 1].content);
      console.log("\n-------------------\n");
    }
  }
  askQuestion();
}