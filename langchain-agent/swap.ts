import type { AccountInterface } from "starknet";
import { executeSwap as avnuExecuteSwap, fetchQuotes, type Quote as AvnuQuote } from "@avnu/avnu-sdk";
import { parseUnits, formatUnits } from "ethers";

const AVNU_OPTIONS = { baseUrl: 'https://sepolia.api.avnu.fi' };

export const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

// Very high slippage to ensure the swap goes through
const MAX_SLIPPAGE = 0.99; // 99% slippage allowed
const MAX_RETRIES = 5;

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
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Executing swap (attempt ${attempt}/${MAX_RETRIES})...`);
      
      // Get a fresh quote each attempt
      const freshQuotes = await fetchQuotes({
        sellTokenAddress: quote.sellTokenAddress,
        buyTokenAddress: quote.buyTokenAddress,
        sellAmount: quote.sellAmount,
        size: 1,
      }, AVNU_OPTIONS);
      
      const freshQuote = freshQuotes[0];
      console.log("📊 Fresh quote details:", {
        sellAmount: freshQuote.sellAmount.toString(),
        buyAmount: freshQuote.buyAmount.toString(),
        quoteId: freshQuote.quoteId
      });

      // Try to execute with increasingly aggressive settings
      const currentSlippage = Math.min(MAX_SLIPPAGE, 0.2 * attempt); // Increase slippage with each attempt
      console.log(`📈 Using slippage: ${currentSlippage * 100}%`);

      const result = await avnuExecuteSwap(
        account,
        freshQuote,
        {
          executeApprove: true,
          slippage: currentSlippage
        }
      );
      
      console.log("✅ Swap executed successfully!");
      return {
        transactionHash: result.transactionHash
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');
      
      if (attempt < MAX_RETRIES) {
        const delay = 1000 * attempt; // Increasing delay between attempts
        console.log(`⏳ Waiting ${delay/1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all attempts failed
  console.error("❌ All swap attempts failed. Last error details:", {
    account: account.address,
    quoteDetails: {
      sellToken: quote.sellTokenAddress,
      buyToken: quote.buyTokenAddress,
      sellAmount: quote.sellAmount.toString(),
      buyAmount: quote.buyAmount.toString()
    }
  });
  throw lastError;
}

export type Quote = AvnuQuote;