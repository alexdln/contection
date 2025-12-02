import { CredentialSession, Agent } from "@atproto/api";

import { type PostViewMinified } from "./types";

const session = new CredentialSession(new URL("https://api.bsky.app"));
const agent = new Agent(session);

export const FEEDS = {
    photo: { query: "#photo", name: "Photo" },
    cat: { query: "#cat", name: "Cats" },
    dog: { query: "#dog", name: "Dogs" },
    nature: { query: "#nature", name: "Nature" },
} as const;

export async function fetchBskyFeed(feedId: keyof typeof FEEDS): Promise<PostViewMinified[] | null> {
    try {
        if (!(feedId in FEEDS)) return null;

        const feed = await agent.app.bsky.feed.searchPosts({
            q: FEEDS[feedId].query,
            limit: 12,
        });

        if (!feed.success) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatImages = (record: Record<string, any>, authorDid: string) => {
            const images = record.embed?.images || record.embed?.media?.images;

            return images?.map(({ image }: { image: { ref: { $link: string } } }) => {
                return `https://cdn.bsky.app/img/feed_thumbnail/plain/${authorDid}/${image.ref.toString()}@jpeg`;
            });
        };

        return feed.data.posts.map((post) => ({
            uri: post.uri,
            author: post.author,
            likeCount: post.likeCount,
            repostCount: post.repostCount,
            replyCount: post.replyCount,
            record: {
                text: typeof post.record.text === "string" ? post.record.text : "",
                embed: {
                    images: formatImages(post.record, post.author.did),
                },
            },
        }));
    } catch (e) {
        console.error(e);

        return null;
    }
}
