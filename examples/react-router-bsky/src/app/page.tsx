import { FeedTabs } from "@/src/components/feed-tabs";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { FeedStoreProvider } from "@/src/providers/feed-store/provider";
import { getStore } from "@/src/providers/feed-store/data";
import { getCachedFeed } from "@/src/lib/get-cached-feed";

import { type Route } from "./+types/page";

import styles from "./page.module.css";

export function meta() {
    return [
        { title: "Bluesky Feeds | RR7 | Contection" },
        {
            name: "description",
            content: "Example React Router v7 app using Contection with Bluesky feeds",
        },
    ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
    const store = await getStore(request);
    const data = await getCachedFeed(store.currentFeed);

    return {
        feed: data.feed ?? [],
        loadedAt: data.loadedAt,
        currentFeed: store.currentFeed,
    };
};

export const ServerComponent: React.FC<{ loaderData: Awaited<ReturnType<typeof loader>> }> = async ({ loaderData }) => {
    const { feed, loadedAt, currentFeed } = loaderData;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Feeds</h1>
                <ThemeToggle />
            </header>
            <main className={styles.main}>
                <FeedStoreProvider initialFeed={currentFeed}>
                    <FeedTabs initialPosts={{ feed, loadedAt }} />
                </FeedStoreProvider>
            </main>
        </div>
    );
};
