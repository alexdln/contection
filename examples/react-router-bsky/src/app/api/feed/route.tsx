import { FEEDS } from "@/src/lib/bsky";
import { getCachedFeed } from "@/src/lib/get-cached-feed";

import { type Route } from "./+types/route";

export const loader = async ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url);
    const feedId = url.searchParams.get("id");

    if (!feedId || !(feedId in FEEDS)) {
        throw new Response(JSON.stringify({ error: "Feed ID is required" }), { status: 400 });
    }

    const feed = await getCachedFeed(feedId as keyof typeof FEEDS);
    return new Response(JSON.stringify(feed));
};
