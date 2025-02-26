import React, { useEffect, useState } from 'react';
import "../css/Post.css";
import Avatar from "@mui/material/Avatar";
import { db } from '../database/firebase';
import { collection, doc, onSnapshot, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

function Post({ postId, user, username, caption, imageUrl }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!postId) return;

    // Reference to the comments collection
    const commentsRef = collection(db, "posts", postId, "comments");

    // Query to order by timestamp (descending for latest comments first)
    const q = query(commentsRef, orderBy("timestamp", "desc"));

    // Real-time listener for comments
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [postId]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const commentsRef = collection(db, "posts", postId, "comments");
      await addDoc(commentsRef, {
        text: comment,
        username: user.displayName, 
        timestamp: serverTimestamp(),
      });
      setComment(''); // Clear input field after posting
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className='post'>
      <div className="post_header">
        <Avatar
          className='post_avatar'
          alt="Abdullah"
          src='/static/images/avatar/1.jpg' 
        /> 
        <h3>{username}</h3>
      </div>

      <img src={imageUrl} className='post_image' alt="" />

      <h4 className='post_text'><strong>{username}</strong> {caption}</h4>

      {/* Comments Section */}
      <div className="post_comments">
        {comments.map((comment, index) => (
          <p key={index}>
            <strong>{comment.username}</strong> {comment.text}
          </p>
        ))}
      </div>

        {/* Comment Input Field */}
      {user && 
        (
          <form className='post_commentBox' onSubmit={postComment}>
            <input
              className="post_input" 
              type="text" 
              placeholder='Add a comment...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className='post_button'
              disabled={!comment.trim()} 
              type="submit"
            >
              Post
            </button>
          </form>
        )
      }
    </div>
  );
}

export default Post;
