import { tool } from "@langchain/core/tools";
import { getAccount } from "../util/wallet";

//! DRAFT
//! needs factory contract
// Function to compile and deploy a new ERC-20 token
const deployTokenTool = tool(async ({ tokenName, tokenSymbol, initialSupply }, options) => {
    try {
      const chatId = options.metadata.thread_id;
      const account = await getAccount(chatId);

      if (!account) {
        return "Account does not exist, you need to create one first.";
      }
  
      // Compile the Cairo contract
      await execAsync('cairo-compile src/erc20_contract.cairo --output compiled_erc20.json');
  
      // Load the compiled contract JSON
      const compiledContract = JSON.parse(fs.readFileSync('./compiled_erc20.json', 'utf8'));
  
      // Deploy the contract
      const deployResponse = await account.deployContract({
        classHash: compiledContract.classHash,
        constructorCalldata: [initialSupply, tokenName, tokenSymbol],
      });
  
      return `Token deployed successfully. Contract address: ${deployResponse.contract_address}`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Error deploying token: ${error.message}`;
      }
      return `Error deploying token: Unknown error occurred`;
    }
  }, {
    name: "deploy_token",
    description: "Deploy a new ERC-20 token on Starknet Sepolia testnet",
    schema: z.object({
      tokenName: z.string().describe("The name of the token"),
      tokenSymbol: z.string().describe("The symbol of the token"),
      initialSupply: z.string().describe("The initial supply of the token"),
    }),
  });