const { CacheHandler } = require("@nimpl/cache-redis/cache-handler");

global.cacheHandler ||= new CacheHandler({
    redisOptions: {
        connectionStrategy: "wait-ignore",
        keyPrefix: "next-bsky:",
    }
});

module.exports = global.cacheHandler;
