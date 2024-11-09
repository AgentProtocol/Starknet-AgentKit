import type { AccountInterface } from "starknet";
import { executeSwap as avnuExecuteSwap, fetchQuotes, type Quote as AvnuQuote } from "@avnu/avnu-sdk";

const AVNU_OPTIONS = {
  baseUrl: 'https://sepolia.api.avnu.fi',
  chainId: 'SN_SEPOLIA'
};

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