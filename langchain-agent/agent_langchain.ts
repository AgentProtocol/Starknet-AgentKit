import * as readline from 'readline';

import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatAnthropic } from "@langchain/anthropic";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver, Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { Account, RpcProvider } from "starknet";
import { RPC_URL, STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY } from './constants.js';
import { generateAccount, deployAccount } from './util/wallet.js';

// Starknet account address and private key
//can be overwritten by the agent if environment variables are not set
// NOTICE: the created account will not persist between runs
let privateKey: string | undefined = STARKNET_PRIVATE_KEY;
let accountAddress: string | undefined = STARKNET_ACCOUNT_ADDRESS;

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
const weatherTool = tool(async ({ query }) => {
  if (query.toLowerCase().includes("sf") || query.toLowerCase().includes("san francisco")) {
    return "It's 60 degrees and foggy."
  }
  return "It's 90 degrees and sunny."
}, {
  name: "weather",
  description: "Call to get the current weather for a location.",
  schema: z.object({
    query: z.string().describe("The query to use in your search."),
  }),
});

// Get a starknet account or generate a new one
const getAccount = async () => {
  if (accountAddress && privateKey) {
    return new Account(provider, accountAddress, privateKey);
  }

  const creationConfirmation = await new Promise<string>((resolve) => {
    rl.question(`To execute onchain transactions we need a funded account. Do you want to deploy a new account? (yes/no): `, resolve);
  })

  if (creationConfirmation.toLowerCase() !== 'yes') {
    return;
  }

  const { privateKey: newPrivateKey, starkKeyPub, OZcontractAddress } = await generateAccount();

  const fundingConfirmation = await new Promise<string>((resolve) => {
    rl.question(`Alright, here is the new account address: ${OZcontractAddress}. Please send some funds to it using the faucet: https://starknet-faucet.vercel.app . Let me know when you're done (yes/no): `, resolve);
  })

  if (fundingConfirmation.toLowerCase() !== 'yes') {
    return;
  }

  await deployAccount(newPrivateKey, starkKeyPub, OZcontractAddress);

  privateKey = newPrivateKey;
  accountAddress = OZcontractAddress;

  return new Account(provider, accountAddress, privateKey);
}

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

const tools = [weatherTool, sendEthTool];
const toolNode = new ToolNode(tools);

const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20240620",
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