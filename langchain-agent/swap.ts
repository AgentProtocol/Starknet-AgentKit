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
  const amountInWei = BigInt(Math.floor(parseFloat(amountIn) * 1e18)).toString();
  
  const params = {
    sellTokenAddress: tokenInAddress,
    buyTokenAddress: tokenOutAddress,
    sellAmount: BigInt(amountInWei),
    size: 1,
  };

  const quotes = await fetchQuotes(params, AVNU_OPTIONS);
  return quotes[0];
}

export async function executeSwap(
  account: AccountInterface,
  quote: AvnuQuote,
  options: ExecuteSwapOptions = {}
): Promise<{ transactionHash: string }> {
  const result = await avnuExecuteSwap(
    account,
    quote,
    {
      ...options,
      executeApprove: true,
      slippage: 0.01
    },
    AVNU_OPTIONS
  );
  
  return {
    transactionHash: result.transactionHash
  };
}

export type Quote = AvnuQuote;