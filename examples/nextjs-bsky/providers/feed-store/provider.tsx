import { type Store } from "./data";
import { FeedStore } from "./store";

export interface FeedStoreProviderProps {
    children: React.ReactNode;
    feed: Store["currentFeed"];
}

export const FeedStoreProvider: React.FC<FeedStoreProviderProps> = async ({ children, feed }) => {
    return <FeedStore value={{ currentFeed: feed }}>{children}</FeedStore>;
};
