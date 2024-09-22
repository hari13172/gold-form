import React, { useState } from "react";
import { ref, set, push } from "firebase/database"; // Push to create a new entry
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // For uploading the image
import { database, storage } from "../firebase"; // Firebase storage and database
import "../styles/PostImage.css";
import Header from "./Header";

function PostImage() {
    const [image, setImage] = useState<File | null>(null);
    const [description, setDescription] = useState<string>("");
    const [uploading, setUploading] = useState<boolean>(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handlePost = async () => {
        if (!image || !description) {
            alert("Please select an image and add a description.");
            return;
        }

        setUploading(true);

        try {
            // Create a unique ID for the image in Firebase storage
            const imageRef = storageRef(storage, `images/${image.name}-${Date.now()}`);

            // Upload the image to Firebase storage
            await uploadBytes(imageRef, image);

            // Get the download URL of the uploaded image
            const imageUrl = await getDownloadURL(imageRef);

            // Push data (image URL and description) to Firebase Realtime Database
            const postsRef = ref(database, "posts");
            const newPostRef = push(postsRef);
            await set(newPostRef, {
                imageUrl,
                description,
            });

            // Reset fields after posting
            setImage(null);
            setDescription("");
            alert("Image and description posted successfully!");
        } catch (error) {
            console.error("Error posting image:", error);
            alert("Error posting image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="post-image-container">
                <h2>Post an Image</h2>
                <div className="image-upload-box">
                    <label htmlFor="imageUpload" className="upload-label">
                        {image ? image.name : "Click to select an image"}
                    </label>
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />
                </div>
                <textarea
                    placeholder="Enter a description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="description-textarea"
                />
                <button onClick={handlePost} disabled={uploading} className="post-button">
                    {uploading ? "Posting..." : "Post"}
                </button>
            </div>
        </>
    );
}

export default PostImage;
