import { tool } from "@langchain/core/tools";
import { getAccount } from "../../util/wallet.js";
import { ETH_ADDRESS } from "../../constants.js";
import { z } from "zod";

/**
 * ETH Transfer Tool
 * 
 * Enables sending ETH transactions on Starknet Sepolia testnet.
 * Features:
 * - Automatic account detection
 * - Amount conversion to wei
 * - Transaction tracking via Starkscan
 */
export const sendEthTool = tool(
    async ({ recipientAddress, amountInEth }, options) => {
      try {
        const chatId = options.metadata.thread_id;
        const account = await getAccount(chatId);
  
        if (!account) {
          return "Account does not exist, you need to create one first.";
        }
  
        // Convert ETH to wei (ETH * 10^18)
        const amountInWei = BigInt(
          Math.floor(parseFloat(amountInEth) * 1e18)
        ).toString();
  
        // Execute ETH transfer
        const result = await account.execute({
          contractAddress: ETH_ADDRESS,
          entrypoint: "transfer",
          calldata: [recipientAddress, amountInWei, "0"],
        });
  
        return `Transaction submitted to Sepolia. Hash: ${result.transaction_hash}
              View on Starkscan: https://sepolia.starkscan.co/tx/${result.transaction_hash}`;
      } catch (error: unknown) {
        if (error instanceof Error) {
          return `Error sending ETH: ${error.message}`;
        }
        return `Error sending ETH: Unknown error occurred`;
      }
    },
    {
      name: "send_eth",
      description: "Send ETH to an address on Starknet Sepolia testnet",
      schema: z.object({
        recipientAddress: z.string().describe("The recipient's Starknet address"),
        amountInEth: z.string().describe("The amount of ETH to send"),
      }),
    }
); 