import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
export const STARKNET_ACCOUNT_ADDRESS = undefined;
export const STARKNET_PRIVATE_KEY = undefined;
export const RPC_URL = process.env.RPC_URL;
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";