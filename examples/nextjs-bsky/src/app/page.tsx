import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { FeedTabs } from "@/src/components/feed-tabs";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { FeedStoreProvider } from "@/src/providers/feed-store/provider";
import { getStore, type Store } from "@/src/providers/feed-store/data";
import { getCachedFeed } from "@/src/lib/get-cached-feed";

import styles from "./page.module.css";

export interface HomePageContentProps {
    feed: Store["currentFeed"];
}

const HomePageContent: React.FC<HomePageContentProps> = async ({ feed }) => {
    "use cache: remote";
    cacheLife({ stale: 30, revalidate: 60, expire: 300 });
    const initialPosts = await getCachedFeed(feed);

    return (
        <FeedStoreProvider initialFeed={feed}>
            <FeedTabs initialPosts={initialPosts} />
        </FeedStoreProvider>
    );
};

const HomePageStore: React.FC = async () => {
    const store = await getStore();

    return <HomePageContent feed={store.currentFeed} />;
};

const HomePage: React.FC = () => (
    <div className={styles.container}>
        <header className={styles.header}>
            <h1 className={styles.title}>Feeds</h1>
            <ThemeToggle />
        </header>
        <main className={styles.main}>
            <Suspense fallback={null}>
                <HomePageStore />
            </Suspense>
        </main>
    </div>
);

export default HomePage;
