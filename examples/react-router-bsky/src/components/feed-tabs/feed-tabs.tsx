"use client";

import { useQuery } from "@tanstack/react-query";
import { useStore, useStoreReducer } from "contection";
import { useRef } from "react";

import { type PostViewMinified } from "@/src/lib/types";
import { FeedStore } from "@/src/providers/feed-store/store";
import { FEEDS } from "@/src/lib/bsky";

import { PostCard } from "../post-card";

import styles from "./feed-tabs.module.css";

interface FeedTabsProps {
    initialPosts: { feed: PostViewMinified[] | null; loadedAt: string };
}

export const FeedTabs: React.FC<FeedTabsProps> = ({ initialPosts }) => {
    const { currentFeed } = useStore(FeedStore, { keys: ["currentFeed"] });
    const [, setStore] = useStoreReducer(FeedStore);
    const initialFeedRef = useRef(currentFeed);

    const {
        data: { feed: posts, loadedAt } = initialFeedRef.current === currentFeed
            ? initialPosts
            : { feed: null, loadedAt: "" },
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["feed", currentFeed],
        queryFn: async () => {
            const response = await fetch(`/api/feed?id=${currentFeed}`);
            if (!response.ok) throw new Error("Failed to fetch feed");
            return response.json() as Promise<{
                feed: PostViewMinified[] | null;
                loadedAt: string;
            }>;
        },
        initialData: initialFeedRef.current === currentFeed ? initialPosts : undefined,
        staleTime: 1000 * 60,
        gcTime: 1000 * 60 * 5,
    });

    const handleFeedChange = (feedId: keyof typeof FEEDS) => {
        setStore({ currentFeed: feedId });
    };

    const showLoading = isLoading || (isFetching && initialFeedRef.current !== currentFeed);

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                {Object.entries(FEEDS).map(([key, feed]) => (
                    <button
                        key={key}
                        className={`${styles.tab} ${currentFeed === key ? styles.active : ""}`}
                        onClick={() => handleFeedChange(key as keyof typeof FEEDS)}
                    >
                        {feed.name}
                    </button>
                ))}
            </div>
            <div className={styles.content}>
                {showLoading || !posts ? (
                    <div className={styles.posts}>
                        <div className={styles.generatedAt}>{showLoading ? `Loading feed...` : `No feed found`}</div>
                    </div>
                ) : (
                    <div className={styles.posts}>
                        <div className={styles.generatedAt}>Loaded at {loadedAt}</div>
                        {posts.map((post, index) => (
                            <PostCard key={post.uri || index} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
