import type { AccountInterface } from "starknet";
import { fetchQuotes, executeSwap as avnuExecuteSwap, type Quote as AvnuQuote } from "@avnu/avnu-sdk";
import { parseUnits, formatUnits } from "ethers";

const AVNU_OPTIONS = { baseUrl: 'https://sepolia.api.avnu.fi' };

// ETH and STRK addresses on Sepolia
export const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

export interface Quote {
  buyAmount: string;
  sellAmount: string;
  // other properties from Avnu SDK Quote interface
}

export interface ExecuteSwapOptions {
  executeApprove?: boolean;
  slippage?: number;
}

export async function checkConnection(): Promise<boolean> {
  try {
    await fetchQuotes({
      sellTokenAddress: "0x1", // dummy value
      buyTokenAddress: "0x2",  // dummy value
      sellAmount: BigInt(1),
      size: 1
    }, AVNU_OPTIONS);
    console.log("✅ Successfully connected to Avnu API");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Avnu API:", error);
    return false;
  }
}

export async function getQuote(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: string
): Promise<AvnuQuote> {
  try {
    // Convert human readable amount to wei
    const amountInWei = BigInt(Math.floor(parseFloat(amountIn) * 1e18)).toString();
    
    const params = {
      sellTokenAddress: tokenInAddress.toLowerCase() === 'eth' ? ETH_ADDRESS : tokenInAddress,
      buyTokenAddress: tokenInAddress.toLowerCase() === 'strk' ? STRK_ADDRESS : tokenOutAddress,
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
    
    // Get a fresh quote right before executing the swap
    console.log("🔄 Refreshing quote...");
    const freshQuotes = await fetchQuotes({
      sellTokenAddress: quote.sellTokenAddress,
      buyTokenAddress: quote.buyTokenAddress,
      sellAmount: quote.sellAmount,
      size: 1
    }, AVNU_OPTIONS);
    
    const freshQuote = freshQuotes[0];
    console.log("✅ Fresh quote received");
    console.log("📊 Quote details:", {
      sellAmount: freshQuote.sellAmount.toString(),
      buyAmount: freshQuote.buyAmount.toString(),
      quoteId: freshQuote.quoteId
    });

    const result = await avnuExecuteSwap(
      account,
      freshQuote,
      options
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
        buyAmount: quote.buyAmount.toString(),
        quoteId: quote.quoteId
      },
      options
    });
    throw error;
  }
}