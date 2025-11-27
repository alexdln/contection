import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { FeedTabsServer } from "@/components/feed-tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeedStoreProvider } from "@/providers/feed-store/provider";
import { getStore, Store } from "@/providers/feed-store/data";

import styles from "./page.module.css";

export interface HomePageContentProps {
    feed: Store["currentFeed"];
}

const HomePageContent: React.FC<HomePageContentProps> = async ({ feed }) => {
    "use cache: remote";
    cacheLife("minutes");

    return (
        <FeedStoreProvider feed={feed}>
            <FeedTabsServer feed={feed} />
        </FeedStoreProvider>
    );
};

const HomePageStore: React.FC = async () => {
    const store = await getStore();

    return <HomePageContent feed={store.currentFeed} />;
};

const HomePage: React.FC = () => {
    return (
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
};

export default HomePage;
