import { FEEDS } from "@/lib/bsky";
import { getCachedFeed } from "@/lib/cache";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const feedId = searchParams.get("id");
    if (!feedId || !(feedId in FEEDS)) {
        return NextResponse.json({ error: "Feed ID is required" }, { status: 400 });
    }

    const feed = await getCachedFeed(feedId as keyof typeof FEEDS);
    return NextResponse.json(feed);
};
