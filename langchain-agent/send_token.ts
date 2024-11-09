import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Account, RpcProvider } from "starknet";
import * as readline from 'readline';
import { RPC_URL } from './constants.js';

// Token addresses (using the same addresses from swap.ts)
const ETH_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

// Create provider without second argument
const provider = new RpcProvider({ nodeUrl: RPC_URL });

export const createSendTokenTool = (rl: readline.Interface) => tool(async ({ token, recipientAddress, amount }) => {
  try {
    // Convert token symbol to address
    const tokenAddress = token.toLowerCase() === 'eth' 
      ? ETH_TOKEN_ADDRESS 
      : token.toLowerCase() === 'strk'
        ? STRK_TOKEN_ADDRESS
        : token; // fallback to direct address if provided

    const tokenSymbol = token.toUpperCase();

    if (!process.env.STARKNET_ACCOUNT_ADDRESS || !process.env.STARKNET_PRIVATE_KEY) {
      return "Error: Missing account credentials in environment variables";
    }

    const account = new Account(
      provider, 
      process.env.STARKNET_ACCOUNT_ADDRESS, 
      process.env.STARKNET_PRIVATE_KEY
    );

    // Get confirmation before proceeding
    const confirmation = await new Promise<string>((resolve) => {
      rl.question(`Do you want to send ${amount} ${tokenSymbol} to ${recipientAddress} on Sepolia? (yes/no): `, resolve);
    });

    if (confirmation.toLowerCase() !== 'yes') {
      return "Transaction cancelled by user.";
    }
    
    // Convert amount to wei (amount * 10^18)
    const amountInWei = (BigInt(Math.floor(parseFloat(amount) * 1e18))).toString();

    // Token transfer call
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