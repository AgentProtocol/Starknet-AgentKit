import type { AccountInterface } from "starknet";
import { executeSwap as avnuExecuteSwap, fetchQuotes, type Quote as AvnuQuote } from "@avnu/avnu-sdk";
import { parseUnits, formatUnits } from "ethers";

const AVNU_OPTIONS = { baseUrl: 'https://sepolia.api.avnu.fi' };

export const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export interface ExecuteSwapOptions {
  executeApprove?: boolean;
  slippage?: number;
}

export async function getQuote(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string
): Promise<AvnuQuote> {
  try {
    const amountInWei = BigInt(Math.floor(parseFloat(amountIn) * 1e18)).toString();
    
    const params = {
      sellTokenAddress: tokenInAddress,
      buyTokenAddress: tokenOutAddress,
      sellAmount: BigInt(amountInWei),
      size: 1,
    };

    console.log("🔍 Fetching quote with params:", params);
    const quotes = await fetchQuotes(params, AVNU_OPTIONS);
    console.log("✅ Quote received successfully");
    return quotes[0];
  } catch (error) {
    console.error("❌ Error fetching quote:", error);
    throw error;
  }
}

export async function executeSwap(
  account: AccountInterface,
  quote: AvnuQuote,
  options: ExecuteSwapOptions = {}
): Promise<{ transactionHash: string }> {
  try {
    console.log("🔄 Executing swap...");
    
    console.log("📊 Quote details:", {
      sellAmount: quote.sellAmount.toString(),
      buyAmount: quote.buyAmount.toString(),
      quoteId: quote.quoteId
    });

    // Execute swap directly with the original quote
    const result = await avnuExecuteSwap(
      account,
      quote,
      {
        ...options,
        executeApprove: true,
        slippage: 0.01
      }
    );
    
    console.log("✅ Swap executed successfully");
    return {
      transactionHash: result.transactionHash
    };
  } catch (error) {
    console.error("❌ Error executing swap:", error);
    console.error("Error details:", {
      account: account.address,
      quoteDetails: {
        sellToken: quote.sellTokenAddress,
        buyToken: quote.buyTokenAddress,
        sellAmount: quote.sellAmount.toString(),
        buyAmount: quote.buyAmount.toString()
      }
    });
    throw error;
  }
}

export type Quote = AvnuQuote;