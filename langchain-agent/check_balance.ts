import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Call, RpcProvider } from 'starknet';
import { toBigInt } from 'ethers';
import { RPC_URL } from "./constants.js";

// Create provider
export const provider = new RpcProvider({ 
    nodeUrl: RPC_URL
});

// Token addresses
const TOKENS: { [key: string]: string } = {
    'eth': '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    'strk': '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d'
};

// Export the tool for the agent
export const checkBalanceTool = tool(async ({ address, asset }) => {
    try {
        // Validate address format
        if (!address.match(/^0x[0-9a-fA-F]+$/)) {
            console.error("Invalid account address");
            return "Error: Invalid address format";
        }

        // Determine token contract address
        let tokenAddress: string;
        const assetLower = asset.toLowerCase();
        
        if (assetLower in TOKENS) {
            tokenAddress = TOKENS[assetLower];
        } else if (asset.match(/^0x[0-9a-fA-F]+$/)) {
            tokenAddress = asset;
        } else {
            return "Error: Invalid asset. Please use 'ETH', 'STRK' or a valid token contract address";
        }

        const accountContract = toBigInt(address).toString();

        const balanceCall: Call = {
            contractAddress: tokenAddress,
            entrypoint: 'balanceOf',
            calldata: [accountContract],
        }
        const balanceResponse = await provider.callContract(balanceCall);

        const decimalCall: Call = {
            contractAddress: tokenAddress,
            entrypoint: 'decimals',
            calldata: [],
        }
        const decimalResponse = await provider.callContract(decimalCall);

        const decimals = parseInt(decimalResponse[0], 16);
        const balance = parseInt(balanceResponse[0], 16) * 10 ** -decimals;
        
        // Get token symbol for display
        const symbol = assetLower in TOKENS ? assetLower.toUpperCase() : 'TOKEN';
        
        return `Balance for ${address}: ${balance} ${symbol}
                View on Starkscan: https://sepolia.starkscan.co/contract/${tokenAddress}`;

    } catch (error) {
        console.error("Balance check error:", error);
        return `Error checking balance: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
}, {
    name: "check_balance",
    description: "Check token balance for an address on Starknet Sepolia testnet. Supports ETH, STRK, or any token contract address.",
    schema: z.object({
        address: z.string().describe("The Starknet address to check"),
        asset: z.string().describe("The asset to check (ETH, STRK, or token contract address)"),
    }),
});