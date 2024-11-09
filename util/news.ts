import Parser from 'rss-parser';

type CustomFeed = { title: string };
type CustomItem = { title: string, description: string, 'content:encoded': string };

const parser = new Parser<CustomFeed, CustomItem>({
  customFields: {
    item: ['title', 'description', 'content:encoded']
  }
});

const feeds = [
  // 'https://blockchainreporter.net/feed/',
  // 'https://cryptoslate.com/feed/',
  'https://www.newsbtc.com/feed/',
  // 'https://cryptopotato.com/feed/',
  // 'https://cryptodaily.co.uk/feed/'
]

export const getNews = async () => {
  const feedArticles = await Promise.all(feeds.map(getArticlesFromRSSFeed));
  const data = feedArticles.flat(1);

  return data;
}   

const getArticlesFromRSSFeed = async (feedUrl: string) => {
  const feed = await parser.parseURL(feedUrl);

  const data = feed.items.map(item => {
    return {
      title: item.title,
      description: item.description,
      content: item['content:encoded'].replace(/<[^>]*>/g, ""), // remove HTML tags from content
    }
  });
  return data;
}