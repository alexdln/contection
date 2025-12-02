import { type PostViewMinified } from "@/src/lib/types";
import styles from "./post-card.module.css";

export interface PostCardProps {
    post: PostViewMinified;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => (
    <div className={styles.post}>
        <div className={styles.postHeader}>
            {post.author.avatar && (
                <img
                    src={post.author.avatar}
                    alt={post.author.displayName || post.author.handle}
                    className={styles.avatar}
                />
            )}
            <div className={styles.authorInfo}>
                <div className={styles.displayName}>{post.author.displayName || post.author.handle}</div>
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
                <img loading="lazy" src={post.record.embed.images[0]} alt="Post image" className={styles.postImage} />
            </div>
        )}
        <div className={styles.postMeta}>
            <span>❤️ {post.likeCount || 0}</span>
            <span>🔄 {post.repostCount || 0}</span>
            <span>💬 {post.replyCount || 0}</span>
        </div>
    </div>
);
