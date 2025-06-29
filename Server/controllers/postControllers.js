const HttpError = require("../models/errorModel");
const postModel = require("../models/postModel");
const userModel = require("../models/userModel");

const { v4: uuid } = require("uuid");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");

//Create Post
//POST :api/posts
//PROTECTED
const createPost = async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body) {
      return next(new HttpError("Fill in text field and choose image", 422));
    }
    if (!req.files.image) {
      return next(new HttpError("Please choose an image", 422));
    } else {
      const { image } = req.files;
      //image should be less than 1mb
      if (image.size > 1000000) {
        return next(
          new HttpError("Profile picture too big.Should be less than 500kb"),
          422
        );
      }
      //rename image
      let fileName = image.name;
      fileName = fileName.split(".");
      fileName = fileName[0] + uuid() + "." + fileName[fileName.length - 1];
      await image.mv(
        path.join(__dirname, "..", "uploads", fileName),
        async (err) => {
          if (err) {
            return next(new HttpError(err));
          }
          //store image on cloudinary
          const result = await cloudinary.uploader.upload(
            path.join(__dirname, "..", "uploads", fileName),
            { resource_type: "image" }
          );
          if (!result.secure_url) {
            return next(
              new HttpError("Could not upload image to cloudinary", 422)
            );
          }
          //save post to DB
          const newPost = await postModel.create({
            creator: req.user.id,
            body,
            image: result.secure_url,
          });
          await userModel.findByIdAndUpdate(newPost?.creator, {
            $push: { posts: newPost?._id },
          });
          res.json(newPost);
        }
      );
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Get Post
//POST :api/posts/:id
//PROTECTED
const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id);
    // const post = await postModel.findById(id).populate("creator").populate({path:"comments", options : {sort: {createdAt: -1}}})
    res.json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET Post
//GET :api/posts
//PROTECTED
const getPosts = async (req, res, next) => {
  try {
    const posts = await postModel.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//UPDATE Post
//PATCH :api/posts/:id
//PROTECTED
const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const { body } = req.body;
    //get post from db
    const post = await postModel.findById(postId);
    //check if creator of the post is the logged in user
    if (post?.creator != req.user.id) {
      return next(
        new HttpError(
          "You can't update this post since you are not the creator",
          403
        )
      );
    }
    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { body },
      { new: true }
    );
    res.json(updatedPost).status(200);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//DELETE Post
//POST :api/posts/:id
//PROTECTED
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    //get post from db
    const post = await postModel.findById(postId);
    //check if creator of the post is the logged in user
    if (post?.creator != req.user.id) {
      return next(
        new HttpError(
          "You can't update this post since you are not the creator",
          403
        )
      );
    }
    const deletedPost = await postModel.findByIdAndDelete(postId);

    // remove post ID from user's posts array
    await userModel.findByIdAndUpdate(post?.creator, {
      $pull: { posts: post?._id },
    });
    res.json(deletedPost);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Get Following Post
//GET :api/posts/following
//PROTECTED
const getFollowingPosts = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    //Get all the posts of follwing user of logged in user
    const posts = await postModel.find({ creator: { $in: user?.following } });
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//LIKE/DISLIKE POST
//GET :api/posts/:id/like
//PROTECTED
const likeDislikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id);
    //Check if the logged in user has already liked post
    let updatedPost;
    if (post?.likes.includes(req.user.id)) {
      updatedPost = await postModel.findByIdAndUpdate(
        id,
        { $pull: { likes: req.user.id } },
        { new: true }
      );
    } else {
      updatedPost = await postModel.findByIdAndUpdate(
        id,
        { $push: { likes: req.user.id } },
        { new: true }
      );
    }
    res.json(updatedPost);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET USER POST
//GET :api/users/:id/posts
//PROTECTED
const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const posts = await userModel
      .findById(userId)
      .populate({ path: "posts", options: { sort: { creeatedAt: -1 } } });
    res.json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//CREATE BOOKMARK
//POST :api/users/:id/bookmark
//PROTECTED
const createBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    //get user and check if post if already in his bookmarks.If so then remove post, otherwise add post to bookmarks
    const user = await userModel.findById(req.user.id);
    const postIsBookmarked = user?.bookmarks?.includes(id);
    if (postIsBookmarked) {
      const userBookmarks = await userModel.findByIdAndUpdate(
        req.user.id,
        { $pull: { bookmarks: id } },
        { new: true }
      );
      res.json(userBookmarks);
    } else {
      const userBookmarks = await userModel.findByIdAndUpdate(
        req.user.id,
        { $push: { bookmarks: id } },
        { new: true }
      );
      res.json(userBookmarks);
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET BOOKMARK
//GET :api/bookmark
//PROTECTED
const getUserBookmarks = async (req, res, next) => {
  try {
    const userBookmarks = await userModel
      .findById(req.user.id)
      .populate({ path: "bookmarks", options: { sort: { createdAt: -1 } } });
    res.json(userBookmarks);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
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
};
