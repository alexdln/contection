import { CacheHandler } from "@nimpl/cache-redis/cache-handler";
import { createCache, createHelpers } from "@nimpl/cache-tools";

const cacheHandler = new CacheHandler({
    redisOptions: {
        connectionStrategy: "wait-ignore",
        keyPrefix: "rr-bsky:",
    },
});

export const { cache } = createCache(cacheHandler);
export const { getKeys, getKeyDetails, getCacheData } = createHelpers(cacheHandler);
