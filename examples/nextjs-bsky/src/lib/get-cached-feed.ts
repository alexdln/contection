"use cache: remote";

import { cacheLife } from "next/cache";

import { type FEEDS, fetchBskyFeed } from "./bsky";

export async function getCachedFeed(id: keyof typeof FEEDS) {
    cacheLife("minutes");
    return { feed: await fetchBskyFeed(id), loadedAt: new Date().toISOString() };
}
