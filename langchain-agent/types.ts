export interface RequestError {
  messages: string[];
  revertError?: string;
}

export interface ContractError extends Error {
  revertError: string;
}

export interface Quote {
  quoteId: string;
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: bigint;
  buyAmount: bigint;
  gasless?: {
    gasTokenPrices: Array<{
      address: string;
      amount: string;
    }>;
  };
}

export interface SwapRoute {
  inputTokenAddress: string;
  outputTokenAddress: string;
  route: Array<{
    pool_key: {
      token0: string;
      token1: string;
      fee: string;
      tick_spacing: number;
      extension: string;
    };
    sqrt_ratio_limit: string;
    skip_ahead: string;
  }>;
} 