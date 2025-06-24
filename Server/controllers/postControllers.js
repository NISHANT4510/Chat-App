const HttpError = require("../middleware/errorMiddleware");
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
    res.json("Create Post");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Get Post
//POST :api/posts/:id
//PROTECTED
const getPost = async (req, res, next) => {
  try {
    res.json("Get Post");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET Post
//GET :api/posts
//PROTECTED
const getPosts = async (req, res, next) => {
  try {
    res.json("Get all Posts");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//UPDATE Post
//PATCH :api/posts/:id
//PROTECTED
const updatePost = async (req, res, next) => {
  try {
    res.json("Update Post");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//DELETE Post
//POST :api/posts/:id
//PROTECTED
const deletePost = async (req, res, next) => {
  try {
    res.json("Delete Post");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Get Following Post
//GET :api/posts/following
//PROTECTED
const getFollowingPosts = async (req, res, next) => {
  try {
    res.json("Get Following Post");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//LIKE/DISLIKE POST
//GET :api/posts/:id/like
//PROTECTED
const likeDislikePost = async (req, res, next) => {
  try {
    res.json("Like/Dislike a Post");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET USER POST
//GET :api/users/:id/posts
//PROTECTED
const getUserPosts = async (req, res, next) => {
  try {
    res.json("Get User Posts");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//CREATE BOOKMARK
//POST :api/users/:id/bookmark
//PROTECTED
const createBookmark = async (req, res, next) => {
  try {
    res.json("Create Bookmark");
  } catch (error) {
    return next(new HttpError(error));
  }
};

//GET BOOKMARK
//GET :api/bookmark
//PROTECTED
const getUserBookmarks = async (req, res, next) => {
  try {
    res.json("Get Bookmarks");
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
