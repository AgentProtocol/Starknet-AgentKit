import { tool } from "@langchain/core/tools";
import { getNews } from "../../util/news.js";

/**
 * News Fetching Tool
 * 
 * Retrieves the latest crypto news from configured RSS feeds.
 * News sources can be customized in util/news.ts
 */
export const getNewsTool = tool(
  async () => {
    return JSON.stringify(await getNews());
  },
  {
    name: "get_news",
    description: "Get the latest crypto news",
  }
); 