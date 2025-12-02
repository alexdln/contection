import { type PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export type PostViewMinified = {
    uri: PostView["uri"];
    author: PostView["author"];
    likeCount: PostView["likeCount"];
    repostCount: PostView["repostCount"];
    replyCount: PostView["replyCount"];
    record: {
        text: string;
        embed: {
            images?: string[];
        };
    };
};
