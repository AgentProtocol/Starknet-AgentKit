import { tool } from "@langchain/core/tools";
import { getNews } from "../util/news.js";

// Tool to fetch latest crypto news
export const getNewsTool = tool(
  async () => {
    return JSON.stringify(await getNews());
  },
  {
    name: "get_news",
    description: "Get the latest crypto news",
  }
);