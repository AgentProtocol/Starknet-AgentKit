import { tool } from "@langchain/core/tools";
import { STARKNET_ACCOUNT_ADDRESS, STARKNET_PRIVATE_KEY } from "../../constants.js";
import { readFromStorage, saveToStorage } from "../../util/storage.js";
import { deployAccount } from "../../util/wallet.js";

/**
 * Account Deployment Tool
 * 
 * Deploys a previously generated Starknet account.
 * Requirements:
 * 1. Account must be generated first
 * 2. Account must be funded before deployment
 * 
 * This is the final step in account creation workflow.
 */
export const deployStarknetAccountTool = tool(async ({ }, options) => {
  if (STARKNET_ACCOUNT_ADDRESS && STARKNET_PRIVATE_KEY) {
    return 'The account is set in the env and cannot be changed.'
  }

  const chatId = options.metadata.thread_id;
  const privateKey = await readFromStorage(`${chatId}:generatedAccountPrivateKey`);

  const { OZcontractAddress } = await deployAccount(privateKey);

  await saveToStorage(`${chatId}:privateKey`, privateKey);
  await saveToStorage(`${chatId}:accountAddress`, OZcontractAddress);

  return `Account deployed. Address: ${OZcontractAddress}`;
}, {
  name: "deploy_starknet_account",
  description: `Deploys the Starknet account / wallet.
    If wallet already exists, it will overwrite it.
    This is the last step in account creation.`
}); 