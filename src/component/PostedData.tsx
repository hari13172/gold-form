import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../firebase"; // Import Firebase database instance
import "../styles/PostedData.css";
import Header from "./Header";

// Modal component for confirming deletion
function ConfirmationModal({ isOpen, onClose, onConfirm }: any) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Are you sure you want to delete this post?</h3>
                <div className="modal-actions">
                    <button onClick={onConfirm} className="confirm-button">
                        Yes, Delete
                    </button>
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

interface PostData {
    imageUrl: string;
    description: string;
    key: string; // Store the Firebase key for each post
}

function PostedData() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

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

    const handleDeleteClick = (postKey: string) => {
        setPostToDelete(postKey);
        setShowModal(true);
    };

    const handleConfirmDelete = () => {
        if (postToDelete) {
            const postRef = ref(database, `posts/${postToDelete}`);
            remove(postRef)
                .then(() => {
                    console.log("Post deleted successfully.");
                    setShowModal(false);
                    setPostToDelete(null); // Reset the postToDelete after deletion
                })
                .catch((error) => {
                    console.error("Error deleting post:", error);
                });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPostToDelete(null); // Reset the postToDelete if deletion is canceled
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

                                {[post.key] && (
                                    <>
                                        <img src={post.imageUrl} alt="Posted" className="post-image" />
                                        <p className="post-description">{post.description}</p>
                                    </>
                                )}
                                <div className="post-card-header">
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteClick(post.key)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No posts available.</p>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
}

export default PostedData;
