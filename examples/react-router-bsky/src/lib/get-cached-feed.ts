import { fetchBskyFeed, type FEEDS } from "./bsky";
import { cache } from "./cache";

export const getCachedFeed = async (id: keyof typeof FEEDS) => {
    const cacheKey = `feed-data:${id}`;

    return cache(cacheKey, async () => {
        const feed = await fetchBskyFeed(id);
        const data = { feed, loadedAt: new Date().toISOString() };
        return data;
    })();
};
