import { tool } from "@langchain/core/tools";
import { getAccount } from "../../util/wallet.js";
import { ETH_ADDRESS, STRK_ADDRESS } from "../../constants.js";
import {
  executeSwap,
  getQuote
} from '../../util/swap.js';
import { z } from "zod";
import { formatUnits } from "ethers";

/**
 * Token Swap Tool
 * 
 * Enables swapping between tokens on Starknet using Avnu protocol
 * Supports ETH/STRK pairs and custom token addresses
 * Includes slippage protection and approval handling
 */
export const swapTool = tool(
  async (input: { tokenInAddress: string; tokenOutAddress: string; amountIn: string }, options) => {
    try {
      // Get user account
      const chatId = options.metadata.thread_id;
      const account = await getAccount(chatId);
      if (!account) {
        return "Account does not exist, you need to create one first.";
      }

      // Normalize token addresses
      const normalizedTokenIn = input.tokenInAddress.toLowerCase() === 'eth'
        ? ETH_ADDRESS
        : input.tokenInAddress.toLowerCase() === 'strk'
          ? STRK_ADDRESS
          : input.tokenInAddress;

      const normalizedTokenOut = input.tokenOutAddress.toLowerCase() === 'eth'
        ? ETH_ADDRESS
        : input.tokenOutAddress.toLowerCase() === 'strk'
          ? STRK_ADDRESS
          : input.tokenOutAddress;

      // Get quote and expected output
      const quote = await getQuote(normalizedTokenIn, normalizedTokenOut, input.amountIn);
      const expectedOutput = formatUnits(quote.buyAmount, 18);

      // Execute swap with slippage protection
      const result = await executeSwap(account, quote, {
        executeApprove: true,
        slippage: 0.01
      });

      return `Swap executed successfully.
              Transaction hash: ${result.transactionHash}`;
    } catch (error) {
      console.error("Error in swap:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return `Failed to execute swap: ${errorMessage}. Please try again with a different amount or check your balance.`;
    }
  },
  {
    name: "swap",
    description: "Swap tokens on Starknet",
    schema: z.object({
      tokenInAddress: z.string().describe("The address of the token to swap from"),
      tokenOutAddress: z.string().describe("The address of the token to swap to"),
      amountIn: z.string().describe("The amount of tokens to swap")
    })
  }
); 