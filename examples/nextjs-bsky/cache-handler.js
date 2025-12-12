const { CacheHandler } = require("@nimpl/cache-redis/cache-handler");

module.exports = new CacheHandler({
    redisOptions: {
        connectionStrategy: "wait-ignore",
        keyPrefix: "next-bsky:",
    }
});
