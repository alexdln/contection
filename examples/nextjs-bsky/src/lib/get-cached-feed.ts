"use cache: remote";

import { cacheLife } from "next/cache";

import { type FEEDS, fetchBskyFeed } from "./bsky";

export async function getCachedFeed(id: keyof typeof FEEDS) {
    cacheLife({ stale: 30, revalidate: 60, expire: 300 });
    return { feed: await fetchBskyFeed(id), loadedAt: new Date().toISOString() };
}
