import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../firebase"; // Import Firebase database instance
import "../styles/PostedData.css";
import Header from "./Header";

interface PostData {
    imageUrl: string;
    description: string;
    key: string; // Store the Firebase key for each post
}

function PostedData() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [minimizedPosts, setMinimizedPosts] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const postsRef = ref(database, "posts");

        // Fetch posts from Firebase
        onValue(postsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const postList = Object.entries(data).map(([key, value]: any) => ({
                key,
                ...value,
            }));
            setPosts(postList as PostData[]);
            setLoading(false);
        });
    }, []);

    const handleDelete = (postKey: string) => {
        const postRef = ref(database, `posts/${postKey}`);
        remove(postRef)
            .then(() => {
                console.log("Post deleted successfully.");
            })
            .catch((error) => {
                console.error("Error deleting post:", error);
            });
    };

    const toggleMinimize = (postKey: string) => {
        setMinimizedPosts((prev) => ({
            ...prev,
            [postKey]: !prev[postKey],
        }));
    };

    return (
        <>
            <Header />
            <div className="posted-data-container">
                <h2>Posted Data</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : posts.length > 0 ? (
                    <div className="posts-grid">
                        {posts.map((post) => (
                            <div key={post.key} className="post-card">
                                <div className="post-card-header">
                                    <button
                                        className="minimize-button"
                                        onClick={() => toggleMinimize(post.key)}
                                    >
                                        {minimizedPosts[post.key] ? "+" : "-"}
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(post.key)}
                                    >
                                        Delete
                                    </button>
                                </div>
                                {!minimizedPosts[post.key] && (
                                    <>
                                        <img src={post.imageUrl} alt="Posted" className="post-image" />
                                        <p className="post-description">{post.description}</p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
        </>
    );
}

export default PostedData;
