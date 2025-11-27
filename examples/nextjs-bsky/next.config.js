/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // This is solely for cacheComponents support in Vercel, if you are self-hosting
  // you can remove these lines and the cache-handlers directory
  cacheHandlers: {
    remote:
      process.env.REDIS_URL && process.env.REDIS_STORE === "true"
        ? require.resolve("./cache-handlers/redis.js")
        : undefined,
  },
};

module.exports = nextConfig;
