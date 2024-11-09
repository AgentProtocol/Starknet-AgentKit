# Starknet Autonomous Agent Toolkit

A template for building autonomous AI agents that can interact with Starknet blockchain using LangChain and a Telegram bot interface.

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
   RPC_URL=your_starknet_rpc_url
   BOT_TOKEN=your_telegram_bot_token
   STORAGE_ENCRYPTION_KEY=your_encryption_key
   STARKNET_ACCOUNT_ADDRESS=your_account_address  #optional
   STARKNET_PRIVATE_KEY=your_private_key  #optional
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
   or to use cli interface instead of Telegram:
   ```bash
   npm dev
   ```

## Extending the Template

### Adding New Tools
Create new tools in `tools/` following the existing pattern:

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const myNewTool = tool(
  async ({ param1, param2 }, options) => {
    // Tool implementation
  },
  {
    name: "my_new_tool",
    description: "Description of what the tool does",
    schema: z.object({
      param1: z.string().describe("Description of param1"),
      param2: z.number().describe("Description of param2"),
    }),
  }
);
```

Then add it to `tools/index.ts` and register in `agent.ts`.

### Project Structure

```
├── tools/
│   ├── account/      # Account management tools
│   ├── monitoring/   # Blockchain monitoring tools
│   ├── token/        # Token interaction tools
│   └── transactions/ # Transaction execution tools
├── util/            # Utility functions
├── agent.ts          # Main agent logic
└── constants.ts      # Configuration constants
```

### Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
