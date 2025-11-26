import { getCachedFeed } from "@/lib/cache";
import { Store } from "@/providers/feed-store/data";

import { FeedTabs } from "./feed-tabs";

export interface FeedTabsServerProps {
    store: Store;
}

export const FeedTabsServer: React.FC<FeedTabsServerProps> = async ({ store }) => {
    const currentFeed = store.currentFeed;
    const initialPosts = await getCachedFeed(currentFeed);
    return <FeedTabs initialPosts={initialPosts} />;
};
