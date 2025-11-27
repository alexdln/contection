import { getCachedFeed } from "@/lib/cache";
import { Store } from "@/providers/feed-store/data";

import { FeedTabs } from "./feed-tabs";

export interface FeedTabsServerProps {
    feed: Store["currentFeed"];
}

export const FeedTabsServer: React.FC<FeedTabsServerProps> = async ({ feed }) => {
    const initialPosts = await getCachedFeed(feed);
    return <FeedTabs initialPosts={initialPosts} />;
};
