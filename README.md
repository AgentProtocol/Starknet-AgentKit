# Starknet Autonomous Agent Template

A template for building autonomous AI agents that can interact with Starknet blockchain using LangChain and Telegram bot interface.

## Overview

This template provides the foundation for creating AI agents that can:
- Execute transactions on Starknet (ETH and ERC20 transfers)
- Interact with DeFi protocols (token swaps)
- Monitor blockchain activity and news
- Manage wallets automatically
- Run background tasks
- Interface through Telegram

The template is built with LangChain's state management and tool system, making it easy to extend with custom capabilities.

## Core Components

- **Agent System**: Built on LangChain's StateGraph for complex conversation flows
- **Tool System**: Modular architecture for blockchain interactions
- **Wallet Management**: Automated account creation and deployment
- **Storage System**: Encrypted persistent storage for sensitive data
- **Telegram Interface**: Ready-to-use bot setup for user interactions

## Getting Started

1. Clone the template:
   ```bash
   git clone <repository-url>
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   RPC_URL=your_starknet_rpc_url
   BOT_TOKEN=your_telegram_bot_token
   STORAGE_ENCRYPTION_KEY=your_encryption_key
   ```

3. Customize the agent:
   - Add new tools in `tools/` directory
   - Modify conversation flows in `agent.ts`
   - Extend background tasks as needed
   - Add custom storage handlers

4. Start the agent:
   ```bash
   npm start
   ```

## Extending the Template

### Adding New Tools
Create new tools in `tools/` following the existing pattern: