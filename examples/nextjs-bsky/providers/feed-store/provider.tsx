import { type Store } from "./data";
import { FeedStore } from "./store";

export interface FeedStoreProviderProps {
    children: React.ReactNode;
    store: Store;
}

export const FeedStoreProvider: React.FC<FeedStoreProviderProps> = async ({ children, store }) => {
    return <FeedStore value={store}>{children}</FeedStore>;
};
