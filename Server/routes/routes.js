const router = require("express").Router()

const {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  editUser,
  followUnfollowUser,
  changeUserAvatar,
} = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");

//USER ROUTES
router.post('/users/register', registerUser)
router.post('/users/login', loginUser)
router.get('/users/:id', getUser)
router.get('/users', getUsers)
router.patch('/users/:id', authMiddleware, editUser)
router.get('/users/:id/follow-unfollow', authMiddleware, followUnfollowUser)
router.post('/users/avatar',authMiddleware, changeUserAvatar)


module.exports = router;