const router = require("express").Router();

const {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  editUser,
  followUnfollowUser,
  changeUserAvatar,
} = require("../controllers/userControllers");
const {
  createComment,
  getPostComments,
  deleteComment,
} = require("../controllers/commentControllers");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts,
  getUserBookmarks,
  createBookmark,
  likeDislikePost,
  getFollowingPosts,
} = require("../controllers/postControllers");

//USER ROUTES
router.post("/users/register", registerUser);
router.post("/users/login", loginUser);
router.get("/users/bookmarks", authMiddleware, getUserBookmarks); //Bought this route up here to avoid conflict with get user
router.get("/users/:id", authMiddleware, getUser);
router.get("/users", authMiddleware, getUsers);
router.patch("/users/:id", authMiddleware, editUser);
router.get("/users/:id/follow-unfollow", authMiddleware, followUnfollowUser);
router.post("/users/avatar", authMiddleware, changeUserAvatar);
router.get("/users/:id/posts", authMiddleware, getUserPosts);

//POST ROUTES
router.post("/post", authMiddleware, createPost);
router.get("/posts/following", authMiddleware, getFollowingPosts);
router.get("/post/:id", authMiddleware, getPost);
router.get("/posts", authMiddleware, getPosts);
router.patch("/posts/:id", authMiddleware, updatePost);
router.delete("/posts/:id", authMiddleware, deletePost);
router.get("/posts/:id/like", authMiddleware, likeDislikePost);
router.get("/posts/:id/bookmark", authMiddleware, createBookmark);


//COMMENT ROUTES
router.post('/comments/:postId',authMiddleware, createComment)
router.get('/comments/:postId',authMiddleware, getPostComments)
router.delete('/comments/:commentId',authMiddleware, deleteComment)


module.exports = router;
