// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import ProfileImage from '../components/ProfileImage';
// import LikeDislikePost from '../components/LikeDislikePost';
// import { useSelector } from 'react-redux';
// import TimeAgo from 'react-timeago';
// import axios from 'axios';
// import { FaRegCommentDots } from 'react-icons/fa';
// import { IoMdSend, IoMdShare } from 'react-icons/io';
// import BookmarksPost from '../components/BookmarksPost';
// import PostComment from '../components/PostComment';

// const SinglePost = () => {
//   const { id } = useParams();
//   const [post, setPost] = useState({});
//   const [comments, setComments] = useState([]);
//   const [comment, setComment] = useState('');
//   const token = useSelector((state) => state?.user?.currentUser?.token);

//   // ✅ Fetch post details and load comments
//   const getPost = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_API_URL}/post/${id}`,
//         { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
//       );
//       setPost(response?.data);
//       setComments(response?.data?.comments || []);
//     } catch (error) {
//       console.log('Error fetching post:', error);
//     }
//   };

//   // ✅ Create new comment without reloading
//   const createComment = async (e) => {
//     e.preventDefault(); // prevent page reload

//     if (!comment.trim()) return;

//     try {
//       const response = await axios.post(
//         `${import.meta.env.VITE_API_URL}/comments/${id}`,
//         { comment },
//         { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
//       );
//       const newComment = response?.data;
//       setComments((prev) => [newComment, ...prev]); // instant UI update
//       setComment(''); 
//     } catch (error) {
//       console.log('Error creating comment:', error);
//     }
//   };

//   // ✅ Delete comment from UI instantly
//   const deleteComment = async (commentId) => {
//     try {
//       await axios.delete(
//         `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
//         { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
//       );
//       setComments((prev) => prev.filter((c) => c?._id !== commentId));
//     } catch (error) {
//       console.log('Error deleting comment:', error);
//     }
//   };

//   // ✅ Load post when component mounts or id changes
//   useEffect(() => {
//     getPost();
//   }, [id]);

//   return (
//     <section className="singlePost">
//       {/* 🧍 Post Header */}
//       <header className="feed__header">
//         <ProfileImage image={post?.creator?.profilePhoto} />
//         <div className="feed__header-details">
//           <h4>{post?.creator?.fullName}</h4>
//           <small>
//             <TimeAgo
//               date={post?.createdAt ? new Date(post.createdAt) : new Date()}
//               title={
//                 post?.createdAt
//                   ? new Date(post.createdAt).toLocaleString()
//                   : ''
//               }
//             />
//           </small>
//         </div>
//       </header>

//       {/* 📝 Post Body */}
//       <div className="feed__body">
//         <p>{post?.body}</p>
//         {post?.image && (
//           <div className="feed__images">
//             <img src={post?.image} alt="" />
//           </div>
//         )}
//       </div>

//       {/* ❤️ Footer Actions */}
//       <footer className="feed__footer">
//         <div>
//           {post?.likes && <LikeDislikePost post={post} />}
//           <button className="feed_footer-comments">
//             <FaRegCommentDots />
//           </button>
//           <button className="feed_footer-share">
//             <IoMdShare />
//           </button>
//         </div>
//         <BookmarksPost post={post} />
//       </footer>

//       {/* 💬 Comments Section */}
//       <ul className="singlePost__comments">
//         <form className="singlePost__comments-form" onSubmit={createComment}>
//           <textarea
//             placeholder="Enter your comment..."
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//           />
//           <button type="submit" className="singlePost__comments-btn">
//             <IoMdSend />
//           </button>
//         </form>

//         {comments.map((c) => (
//           <PostComment
//             key={c?._id}
//             comment={c}
//             onDeleteComment={deleteComment}
//           />
//         ))}
//       </ul>
//     </section>
//   );
// };

// export default SinglePost;




import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfileImage from '../components/ProfileImage';
import LikeDislikePost from '../components/LikeDislikePost';
import { useSelector } from 'react-redux';
import TimeAgo from 'react-timeago';
import axios from 'axios';
import { FaRegCommentDots } from 'react-icons/fa';
import { IoMdSend, IoMdShare } from 'react-icons/io';
import BookmarksPost from '../components/BookmarksPost';
import PostComment from '../components/PostComment';

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const token = useSelector((state) => state?.user?.currentUser?.token);

  // ✅ Fetch post details and comments
  const getPost = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/post/${id}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(response?.data);
      setComments(response?.data?.comments || []);
    } catch (error) {
      console.error('Error fetching post:', error.response?.data || error.message);
    }
  };

  // ✅ Create a new comment
  const createComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/comments/${id}`, // match backend route
        { comment },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = response.data;
      setComments((prev) => [newComment, ...prev]); // add to UI after successful save
      setComment('');
    } catch (error) {
      console.error('Error creating comment:', error.response?.data || error.message);
    }
  };

  // ✅ Delete a comment
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/comments/${commentId}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => prev.filter((c) => c?._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error.response?.data || error.message);
    }
  };

  // ✅ Load post on mount or when id changes
  useEffect(() => {
    getPost();
  }, [id]);

  return (
    <section className="singlePost">
      {/* 🧍 Post Header */}
      <header className="feed__header">
        <ProfileImage image={post?.creator?.profilePhoto} />
        <div className="feed__header-details">
          <h4>{post?.creator?.fullName}</h4>
          <small>
            <TimeAgo
              date={post?.createdAt ? new Date(post.createdAt) : new Date()}
              title={
                post?.createdAt ? new Date(post.createdAt).toLocaleString() : ''
              }
            />
          </small>
        </div>
      </header>

      {/* 📝 Post Body */}
      <div className="feed__body">
        <p>{post?.body}</p>
        {post?.image && (
          <div className="feed__images">
            <img src={post?.image} alt="" />
          </div>
        )}
      </div>

      {/* ❤️ Footer Actions */}
      <footer className="feed__footer">
        <div>
          {post?.likes && <LikeDislikePost post={post} />}
          <button className="feed_footer-comments">
            <FaRegCommentDots />
          </button>
          <button className="feed_footer-share">
            <IoMdShare />
          </button>
        </div>
        <BookmarksPost post={post} />
      </footer>

      {/* 💬 Comments Section */}
      <ul className="singlePost__comments">
        <form className="singlePost__comments-form" onSubmit={createComment}>
          <textarea
            placeholder="Enter your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="singlePost__comments-btn">
            <IoMdSend />
          </button>
        </form>

        {comments.map((c) => (
          <PostComment
            key={c?._id}
            comment={c}
            onDeleteComment={deleteComment}
          />
        ))}
      </ul>
    </section>
  );
};

export default SinglePost;





