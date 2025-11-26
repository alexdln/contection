"use client";

import { useQuery } from "@tanstack/react-query";
import { useStore, useStoreReducer } from "contection";
import { useRef } from "react";

import { type PostViewMinified } from "@/lib/types";
import { FeedStore } from "@/providers/feed-store/store";
import { FEEDS } from "@/lib/bsky";

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
        queryFn: () =>
            fetch(`/api/feed?id=${currentFeed}`).then((res) => res.json()) as Promise<{
                feed: PostViewMinified[] | null;
                loadedAt: string;
            }>,
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
                            <div key={post.uri || index} className={styles.post}>
                                <div className={styles.postHeader}>
                                    {post.author.avatar && (
                                        <img
                                            src={post.author.avatar}
                                            alt={post.author.displayName || post.author.handle}
                                            className={styles.avatar}
                                        />
                                    )}
                                    <div className={styles.authorInfo}>
                                        <div className={styles.displayName}>
                                            {post.author.displayName || post.author.handle}
                                        </div>
                                        <div className={styles.handle}>@{post.author.handle}</div>
                                    </div>
                                </div>
                                <div className={styles.postText}>{post.record.text}</div>
                                {post.record.embed.images && post.record.embed.images.length > 0 && (
                                    <div className={styles.postImageContainer}>
                                        <img
                                            loading="lazy"
                                            src={post.record.embed.images[0]}
                                            alt="Post image"
                                            className={styles.postImageBackground}
                                        />
                                        <img
                                            loading="lazy"
                                            src={post.record.embed.images[0]}
                                            alt="Post image"
                                            className={styles.postImage}
                                        />
                                    </div>
                                )}
                                <div className={styles.postMeta}>
                                    <span>❤️ {post.likeCount || 0}</span>
                                    <span>🔄 {post.repostCount || 0}</span>
                                    <span>💬 {post.replyCount || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
