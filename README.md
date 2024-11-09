# stark_agent_007

An AI agent built with LangChain that can interact with Starknet blockchain and monitor crypto news through a Telegram bot interface.

## Features

- Send ETH and ERC20 token transactions on Starknet Sepolia testnet
- Check wallet balances
- Swap tokens using automated market makers
- Monitor and summarize crypto news in real-time
- Telegram bot interface for easy interaction
- Automatic wallet creation and deployment
- Background task management for periodic actions

## Prerequisites

- Node.js and npm installed
- Starknet wallet with some testnet ETH (or let the agent create one for you)
- OpenAI API key for the LLM functionality (GPT-4)
- Anthropic API key for additional AI capabilities
- Alchemy RPC URL for Starknet
- Telegram bot token
- Storage encryption key for secure data handling

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   STARKNET_ACCOUNT_ADDRESS=your_starknet_account_address (optional)
   STARKNET_PRIVATE_KEY=your_starknet_private_key (optional)
   RPC_URL=your_alchemy_rpc_url
   BOT_TOKEN=your_telegram_bot_token
   STORAGE_ENCRYPTION_KEY=your_encryption_key
   ```

4. If you don't have a Starknet account, don't worry! The agent can create and deploy one for you. Just make sure to fund it using the [Starknet Sepolia Faucet](https://starknet-faucet.vercel.app).

5. Start the agent:
   ```bash
   npm start
   ```

6. Interact with the agent through Telegram. Try these example commands:
   - "Check my wallet balance"
   - "Send 0.01 ETH to 0x123..."
   - "Send 10 USDC to 0x456..."
   - "Swap 0.1 ETH for USDC"
   - "Start monitoring crypto news and give me updates every 5 minutes"
   - "Stop monitoring news"
   - "Create a new Starknet wallet for me"
   - "Deploy my Starknet account"