import { FEEDS } from "@/src/lib/bsky";

import { FeedStore } from "./store";

export interface FeedStoreProviderProps {
    children: React.ReactNode;
    initialFeed: keyof typeof FEEDS;
}

export const FeedStoreProvider: React.FC<FeedStoreProviderProps> = ({ children, initialFeed }) => {
    return <FeedStore value={{ currentFeed: initialFeed }}>{children}</FeedStore>;
};
