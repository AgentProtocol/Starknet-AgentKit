import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
export const STARKNET_ACCOUNT_ADDRESS = undefined;
export const STARKNET_PRIVATE_KEY = undefined;
export const RPC_URL = process.env.RPC_URL;