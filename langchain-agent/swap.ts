/**
 * Execute the exchange
 *
 * @param account The account of the trader
 * @param quote The selected quote. See `getQuotes`
 * @param executeApprove False if the taker already executed `approve`
 * @param gasless False if the user wants to execute the transaction himself
 * @param gasTokenAddress The gas token address that will be used to pay the gas fees (required when gasless is true)
 * @param maxGasTokenAmount The maximum amount of gas token that the user is willing to spend (required when gasless is true)
 * @param executeGaslessTxCallback This function is called after the user signed the typed data and just before calling the API to execute the transaction
 * @param slippage The maximum acceptable slippage of the buyAmount amount. Default value is 5%. 0.05 is 5%.
 * This value is ignored if slippage is not applicable to the selected quote
 * @param options Optional options.
 * @returns Promise<InvokeSwapResponse>
 */
const executeSwap = async (
    account: AccountInterface,
    quote: Quote,
    {
      executeApprove = true,
      gasless = false,
      gasTokenAddress,
      maxGasTokenAmount,
      slippage = 0.005,
      executeGaslessTxCallback,
    }: ExecuteSwapOptions = {},
    options?: AvnuOptions,
  ): Promise<InvokeSwapResponse>
  
  export interface ExecuteSwapOptions {
    executeApprove?: boolean;
    gasless?: boolean;
    gasTokenAddress?: string;
    maxGasTokenAmount?: bigint;
    slippage?: number;
    executeGaslessTxCallback?: () => unknown;
  }
  
  export interface InvokeSwapResponse {
    transactionHash: string;
    gasTokenAddress?: string;
    gasTokenAmount?: bigint;
  }
  