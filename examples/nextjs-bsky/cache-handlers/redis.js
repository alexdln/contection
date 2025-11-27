// This handler is a combination of the example from the next.js docs
// for redis, defaultCacheHandler from next.js and local improvements.
// Its use is a necessary measure to add support for cacheComponents
// to Vercel and keep the example fast and free for the author.
// Vercel's LRU cache is used only for request-per-request caching,
// while Redis allows for data storage between requests.
// This works significantly better with self-hosted caching.
//
// There's also an "init" function. This isn't part of the standard
// cache-handler functionality. It was added to remove stale entries
// from previous builds. This is important to avoid exceeding the 30MB
// limit in the free Redis plan.
// This logic maintains the cache of the last two builds to ensure safe deployment.

const fs = require("fs/promises");
const path = require("path");
const { createClient } = require("redis");
const { LRUCache } = require("lru-cache");

const thread = require("./thread.js");

const client = createClient({ url: process.env.REDIS_URL });
client.connect();

const LRU_MAX_SIZE =
  parseInt(process.env.LRU_CACHE_MAX_SIZE || "50", 10) * 1024 * 1024;

const memoryCache = new LRUCache({
  maxSize: LRU_MAX_SIZE,
  sizeCalculation: (entry) => entry.size,
});

const pendingSets = new Map();

module.exports = {
  async init() {
    const buildId = await fs.readFile(
      path.join(process.cwd(), ".next", "BUILD_ID"),
      "utf8"
    );
    const prevId = await client.get("buildId");

    if (prevId === buildId) return;

    await client.set("buildId", buildId);
    const validKeyRegex = new RegExp(`\\["(${prevId}|${buildId})",|buildId`);
    const keys = await client.keys("*");

    await thread(keys, client, validKeyRegex);
  },

  async get(cacheKey, softTags) {
    const pendingPromise = pendingSets.get(cacheKey);
    if (pendingPromise) await pendingPromise;

    const memoryEntry = memoryCache.get(cacheKey);
    if (memoryEntry) {
      const entry = memoryEntry.entry;

      if (
        performance.timeOrigin + performance.now() >
        entry.timestamp + entry.revalidate * 1000
      ) {
        memoryCache.delete(cacheKey);
      } else {
        const [returnStream, newSaved] = entry.value.tee();
        entry.value = newSaved;

        return {
          ...entry,
          value: returnStream,
        };
      }
    }

    const redisEntry = await client.get(cacheKey);

    if (!redisEntry) return undefined;

    const data = JSON.parse(redisEntry);
    const buffer = Buffer.from(data.value, "base64");
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(buffer);
        controller.close();
      },
    });

    const entry = {
      value: stream,
      tags: data.tags,
      stale: data.stale,
      timestamp: data.timestamp,
      expire: data.expire,
      revalidate: data.revalidate,
    };

    if (
      performance.timeOrigin + performance.now() >
      entry.timestamp + entry.revalidate * 1000
    ) {
      await client.del(cacheKey);
      return undefined;
    }

    const size = buffer.byteLength;
    const [returnStream, newSaved] = entry.value.tee();
    entry.value = returnStream;

    memoryCache.set(cacheKey, {
      entry,
      size,
      expire: entry.expire,
    });

    return {
      ...entry,
      value: newSaved,
    };
  },

  async set(cacheKey, pendingEntry) {
    let resolvePending = () => {};
    const pendingPromise = new Promise((resolve) => {
      resolvePending = resolve;
    });
    pendingSets.set(cacheKey, pendingPromise);

    try {
      const entry = await pendingEntry;

      const reader = entry.value.getReader();
      const chunks = [];

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      const data = Buffer.concat(chunks.map(Buffer.from));
      const size = data.byteLength;

      const lruStream = new ReadableStream({
        start(controller) {
          controller.enqueue(data);
          controller.close();
        },
      });

      const lruEntry = {
        ...entry,
        value: lruStream,
      };

      memoryCache.set(cacheKey, {
        entry: lruEntry,
        isErrored: false,
        errorRetryCount: 0,
        size,
      });

      await client.set(
        cacheKey,
        JSON.stringify({
          value: data.toString("base64"),
          tags: entry.tags,
          stale: entry.stale,
          timestamp: entry.timestamp,
          expire: entry.expire,
          revalidate: entry.revalidate,
        }),
        { EX: entry.expire }
      );
    } catch (err) {
      memoryCache.delete(cacheKey);
      throw err;
    } finally {
      resolvePending();
      pendingSets.delete(cacheKey);
    }
  },

  async refreshTags() {
    //
  },

  async getExpiration(tags) {
    return 0;
  },

  async updateTags(tags, durations) {
    //
  },
};
