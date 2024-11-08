import * as readline from 'readline';

import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { RpcProvider } from "starknet";
import { RPC_URL, STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY } from './constants.js';
import { generateAccount, deployAccount, getAccount } from './util/wallet.js';
import { checkBalanceTool } from './check_balance.js';
import { getNews } from './util/news.js';
import { ChatOpenAI } from '@langchain/openai';
import { saveToStorage } from './util/storage.js';

// // Starknet account address and private key
// // can be overwritten by the agent if environment variables are not set
// // NOTICE: the created account will not persist between runs
// let privateKey: string | undefined = STARKNET_PRIVATE_KEY;
// let accountAddress: string | undefined = STARKNET_ACCOUNT_ADDRESS;

// Interval ID for the news loop
let backgroundActionInterval: NodeJS.Timeout | undefined;

// Alchemy Starknet RPC
const provider = new RpcProvider({ 
  nodeUrl: RPC_URL
});

// ETH token address on Starknet Sepolia
const ETH_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";


// Define the graph state
const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  })
})

// Define the tools for the agent to use

// Tool to send ETH transactions on Starknet Sepolia testnet
// Takes recipient address and ETH amount as input
// Prompts user for confirmation before sending
// Returns transaction hash and Starkscan link on success
// Handles errors and returns error messages on failure
const sendEthTool = tool(async ({ recipientAddress, amountInEth }) => {
  try {

    const account = await getAccount();

    if (!account) {
      return "Transaction cancelled by user.";
    }

    // Get confirmation before proceeding
    const confirmation = await new Promise<string>((resolve) => {
      rl.question(`Do you want to send ${amountInEth} ETH to ${recipientAddress} on Sepolia? (yes/no): `, resolve);
    });

    if (confirmation.toLowerCase() !== 'yes') {
      return "Transaction cancelled by user.";
    }

    // Convert ETH to wei (ETH * 10^18)
    const amountInWei = (BigInt(Math.floor(parseFloat(amountInEth) * 1e18))).toString();

    // ETH transfer call
    const result = await account.execute({
      contractAddress: ETH_TOKEN_ADDRESS,
      entrypoint: 'transfer',
      calldata: [recipientAddress, amountInWei, '0'],
    });

    return `Transaction submitted to Sepolia. Hash: ${result.transaction_hash}
            View on Starkscan: https://sepolia.starkscan.co/tx/${result.transaction_hash}`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return `Error sending ETH: ${error.message}`;
    }
    return `Error sending ETH: Unknown error occurred`;
  }
}, {
  name: "send_eth",
  description: "Send ETH to an address on Starknet Sepolia testnet",
  schema: z.object({
    recipientAddress: z.string().describe("The recipient's Starknet address"),
    amountInEth: z.string().describe("The amount of ETH to send"),
  }),
});

// Tool to get the current starknet account
const getCurrentAccountTool = tool(async () => {
  const account = await getAccount();
  if (!account) {
    return 'Account does not exist, you need to create one first.';
  }
  return account.address;
}, {
  name: "get_starknet_account",
  description: "Call to get current starkent account the agent is using."
});


// Tool to create a new Starknet account/wallet.
// Generates new account credentials (private key, public key, contract address).
// Prompts user to fund account via faucet before deployment.
// Deploys account contract if funding confirmed.
// Saves credentials to encrypted storage.
// If account is set in the env it does not allow overwriting it
// Returns initialized Account address on success.
const createStarknetAccountTool = tool(async () => {
  if (STARKNET_ACCOUNT_ADDRESS && STARKNET_PRIVATE_KEY) {
    return 'The account is set in the env and cannot be changed.'
  }
  const { privateKey: newPrivateKey, starkKeyPub, OZcontractAddress } = await generateAccount();

  const fundingConfirmation = await new Promise<string>((resolve) => {
    rl.question(`Alright, here is the new account address: ${OZcontractAddress} . Please send some funds to it using the faucet: https://starknet-faucet.vercel.app . Let me know when you're done (yes/no): `, resolve);
  })

  if (fundingConfirmation.toLowerCase() !== 'yes') {
    return 'Canceled by the user';
  }

  await deployAccount(newPrivateKey, starkKeyPub, OZcontractAddress);

  await saveToStorage('privateKey', newPrivateKey);
  await saveToStorage('accountAddress', OZcontractAddress);

  return `New account address: ${OZcontractAddress}`;
}, {
  name: "create_starknet_account",
  description: "Creates a new Starknet account / wallet. If wallet already exists, it will overwrite it."
})

// Tool to fetch latest crypto news
// Makes API call to get current news articles
// Returns news data as JSON string
// Used for getting real-time updates on crypto market news and developments
const getNewsTool = tool(async () => {
  return JSON.stringify(await getNews());
}, {
  name: "get_news",
  description: "Call to get news."
});

// Tool to start a periodic background action loop.
// Sets up an interval to execute a specified action at given frequency.
// For each interval:
//   - Executes the provided action through the LLM
//   - Prints the LLM response to console
//   - Restores the command prompt
// If a previous loop exists, stops it before starting new one.
// Returns confirmation message when loop is started.
const startBackgroundAction = tool(async ({ whatToDo, intervalInSeconds }) => {
  if (backgroundActionInterval) {
    clearInterval(backgroundActionInterval);
    backgroundActionInterval = undefined;
  }
  const sumarizeNews = async () => {
    const message = whatToDo;

    const finalState = await app.invoke(
      { messages: [ new HumanMessage(message)] },
      { configurable: { thread_id: "42" } }
    );
    console.log('\n------UPDATE------\n')
    console.log(finalState.messages[finalState.messages.length - 1].content);
    console.log('\n-------------------\n');

    // Move the cursor back to the input line
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 1); // Clear the current line
    rl.prompt(); // Show the prompt again
  }
  backgroundActionInterval = await setInterval(sumarizeNews, intervalInSeconds * 1000);
  return "Started.";
}, {
  name: "start_background_action",
  description: "Call to start a loop that executes an action every X seconds. Or stop the current loop and start a new one.",
  schema: z.object({
    whatToDo: z.string().describe("The action that you want to execute every X second."),
    intervalInSeconds: z.number().describe("The number of seconds that needs to pass before the news are fetched again."),
  }),
});


// Tool to stop a background action loop.
// Checks if an interval is currently running.
// If running, clears the interval and resets the interval ID.
// Returns confirmation message when loop is stopped.
const stopBackgroundAction = tool(async () => {
  if (backgroundActionInterval) {
    clearInterval(backgroundActionInterval);
    backgroundActionInterval = undefined;
  }
  return "Stopped.";
}, {
  name: "stop_background_action",
  description: "Call to end a loop that executes an action every X seconds."
});

// Declare tools once and include all tools
const tools = [sendEthTool, checkBalanceTool, startBackgroundAction, stopBackgroundAction, getNewsTool, getCurrentAccountTool, createStarknetAccountTool];
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
  output: process.stdout
});

async function askQuestion() {
  while (true) {
    const question = await new Promise<string>((resolve) => {
      rl.question('Ask a question (or type "exit" to quit): ', resolve);
    });

    if (question.toLowerCase() === 'exit') {
      if (backgroundActionInterval) {
        clearInterval(backgroundActionInterval);
        backgroundActionInterval = undefined;
      }
      rl.close();
      break;
    }

    const finalState = await app.invoke(
      { messages: [new HumanMessage(question)] },
      { configurable: { thread_id: "42" } }
    );

    console.log(finalState.messages[finalState.messages.length - 1].content);
    console.log('\n-------------------\n');
  }
}

askQuestion();