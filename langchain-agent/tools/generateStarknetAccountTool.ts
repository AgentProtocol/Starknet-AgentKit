import { tool } from "@langchain/core/tools";
import { STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY } from "../constants.js";
import { generateAccount } from "../util/wallet.js";
import { saveToStorage } from "../util/storage.js";

// Tool to generate a new Starknet account
// Creates new account credentials but does not deploy the contract
// Saves private key to storage for later deployment
// Returns the account address for funding
export const generateStarknetAccountTool = tool(async ({ }, options) => {
  if (STARKNET_ACCOUNT_ADDRESS && STARKNET_PRIVATE_KEY) {
    return 'The account is set in the env and cannot be changed.'
  }
  const { privateKey: newPrivateKey, OZcontractAddress } = await generateAccount();

  const chatId = options.metadata.thread_id
  await saveToStorage(`${chatId}:generatedAccountPrivateKey`, newPrivateKey);

  return `Here is the new account address: ${OZcontractAddress} . Please send some funds to it using the faucet: https://starknet-faucet.vercel.app . Let me know when you're done and I will deploy the account.`;
}, {
  name: "generate_starknet_account",
  description: `Generates a new Starknet account address.
      If one already exists, it will overwrite it.
      This is the first step in account creation.
      After this the user needs to fund the address and when it is funded we need to deploy the account.`
})