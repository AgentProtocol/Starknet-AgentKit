import { tool } from "@langchain/core/tools";
import { getAccount } from "../../util/wallet.js";

/**
 * Current Account Tool
 * 
 * Retrieves the current Starknet account address for the user.
 * Used to check if an account exists and get its address.
 */
export const getCurrentAccountTool = tool(async ({ }, options) => {
  const chatId = options.metadata.thread_id;
  const account = await getAccount(chatId);
  if (!account) {
    return 'Account does not exist, you need to create one first.';
  }
  return account.address;
}, {
  name: "get_starknet_account",
  description: "Get the address of the current Starknet account"
}); 