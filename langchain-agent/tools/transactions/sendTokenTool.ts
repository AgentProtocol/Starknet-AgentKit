import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ETH_ADDRESS, STRK_ADDRESS } from '../../constants.js';
import { getAccount } from "../../util/wallet.js";

/**
 * Token Transfer Tool
 * 
 * Enables sending any ERC20 token on Starknet Sepolia testnet.
 * Features:
 * - Support for ETH and STRK tokens
 * - Custom token address support
 * - Amount conversion to wei
 * - Transaction tracking via Starkscan
 */
export const sendTokenTool = tool(async ({ token, recipientAddress, amount }, options) => {
  try {
    const chatId = options.metadata.thread_id;
    const account = await getAccount(chatId);

    if (!account) {
      return "Account does not exist, you need to create one first.";
    }

    // Convert token symbol to address
    const tokenAddress = token.toLowerCase() === 'eth' 
      ? ETH_ADDRESS 
      : token.toLowerCase() === 'strk'
        ? STRK_ADDRESS
        : token; // fallback to direct address if provided
    
    // Convert amount to wei (amount * 10^18)
    const amountInWei = (BigInt(Math.floor(parseFloat(amount) * 1e18))).toString();

    // Execute token transfer
    const result = await account.execute({
      contractAddress: tokenAddress,
      entrypoint: 'transfer',
      calldata: [recipientAddress, amountInWei, '0'],
    });

    return `Transaction submitted to Sepolia. Hash: ${result.transaction_hash}
            View on Starkscan: https://sepolia.starkscan.co/tx/${result.transaction_hash}`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return `Error sending ${token}: ${error.message}`;
    }
    return `Error sending ${token}: Unknown error occurred`;
  }
}, {
  name: "send_token",
  description: "Send ETH or STRK tokens to an address on Starknet Sepolia testnet",
  schema: z.object({
    token: z.string().describe("The token to send (ETH or STRK)"),
    recipientAddress: z.string().describe("The recipient's Starknet address"),
    amount: z.string().describe("The amount of tokens to send"),
  }),
}); 