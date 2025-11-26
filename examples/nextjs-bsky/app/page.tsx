import { cacheLife } from "next/cache";
import { Suspense } from "react";

import { FeedTabsServer } from "@/components/feed-tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeedStoreProvider } from "@/providers/feed-store/provider";
import { getStore, Store } from "@/providers/feed-store/data";

import styles from "./page.module.css";

export interface HomePageContentProps {
    store: Store;
}

const HomePageContent: React.FC<HomePageContentProps> = async ({ store }) => {
    "use cache";
    cacheLife("minutes");

    return (
        <FeedStoreProvider store={store}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Feeds</h1>
                    <ThemeToggle />
                </header>
                <main className={styles.main}>
                    <FeedTabsServer store={store} />
                </main>
            </div>
        </FeedStoreProvider>
    );
};

const HomePageStore: React.FC = async () => {
    const store = await getStore();

    return <HomePageContent store={store} />;
};

const HomePage: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <HomePageStore />
        </Suspense>
    );
};

export default HomePage;
