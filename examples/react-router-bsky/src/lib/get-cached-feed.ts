import { fetchBskyFeed, type FEEDS } from "./bsky";
import { cache } from "../../cache-handler";

export const getCachedFeed = async (id: keyof typeof FEEDS) => {
    const cacheKey = `feed-data:${id}`;

    if (!import.meta.env.REDIS_URL && import.meta.env.VITE_REDIS_STORE !== "true") {
        return { feed: await fetchBskyFeed(id), loadedAt: new Date().toISOString() };
    }

    const cachedLoad = cache(
        async () => {
            const feed = await fetchBskyFeed(id);
            return { feed, loadedAt: new Date().toISOString() };
        },
        { key: cacheKey, duration: { stale: 30, revalidate: 60, expire: 300 } },
    );

    return cachedLoad();
};
