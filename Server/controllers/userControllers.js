const HttpError = require("../models/errorModel");
const userModel = require("../models/userModel");
const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid").v4;
const fs = require("fs")
const path = require("path")
const cloudinary = require("../utils/cloudinary")


//=======================REGISTER USER
//POST : api/users/register
//UNPROTECTED
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    if (!fullName || !email || !password || !confirmPassword) {
      return next(new HttpError("Please fill in all fields", 422));
    }
    //make the email lowercase
    const lowerCaseEmail = email.toLowerCase();
    //check if the email is already in DB
    const emailExists = await UserModel.findOne({ email: lowerCaseEmail });
    if (emailExists) {
      return next(new HttpError("Email already exists", 422));
    }
    //check if password and confirmPassword are the same
    if (password != confirmPassword) {
      return next(new HttpError("Passwords do not match", 422));
    }
    //check password length
    if (password.length < 6) {
      return next(
        new HttpError("Password must be at least 6 characters long", 422)
      );
    }
    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //add user to DB
    const newUser = await UserModel.create({
      fullName,
      email: lowerCaseEmail,
      password: hashedPassword,
    });
    res.json(newUser).status(201);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//=======================LOGIN USER
//POST : api/users/login
//UNPROTECTED
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new HttpError("Please fill in all fields", 422));
    }
    //make email lowercase
    const lowerCase = email.toLowerCase();
    //fetch user from DB
    const user = await userModel.findOne({ email: lowerCase });
    if (!user) {
      return next(new HttpError("Invalid Credential", 422));
    }
    // const {uPassword, ...userInfo} = user;
    //compare password
    const comparePass = await bcrypt.compare(password, user?.password);
    if (!comparePass) {
      return next(new HttpError("Invalid Credential", 422));
    }
    const token = await jwt.sign({ id: user?._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, id: user?._id }).status(200);
    // res.json({token, id: user?._id, ...userInfo}).status(200)
  } catch (error) {
    return next(new HttpError(error));
  }
};

//=======================GET USER
//GET : api/users/:id
//PROTECTED
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) {
      return next(new HttpError("User not found, 422"));
    }
    res.json(user).status(200);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//=======================GET USER
//GET : api/users
//PROTECTED
const getUsers = async (req, res, next) => {
  try {
    const users = await userModel.find().limit(10).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//=======================EDIT USER
//PATCH : api/users/edit
//PROTECTED
const editUser = async (req, res, next) => {
  try {
    const { fullName, bio } = req.body;
    const editedUser = await userModel.findByIdAndUpdate(
      req.user.id,
      { fullName, bio },
      { new: true }
    );
    res.json(editedUser).status(200);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//=======================FOLLOE/UNFOLLOW USER
//PATCH : api/users/:id/follow-unfollow
//PROTECTED
const changeUserAvatar = async (req, res, next) => {
  try {
    if(!req.files.avatar){
      return next(new HttpError("Please choose an image", 422))
    }
    const {avatar} = req.files;
    //check file size
    if(avatar.size > 5000000){
      return next(new HttpError("Profile Picture too big, Should be less than 500kb"))
    }
    //Generate Unique File Name
    let fileName = avatar.name;
    let splittedFilename = fileName.split(".")
    let newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
    avatar.mv(path.join(__dirname, "..", "uploads", newFilename), async (err)=>{
      if(err){
        return next(new HttpError(err))
      }
      //Store image in cloudinary
      const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFilename),{resource_type:"image"});
      if(!result.secure_url){
        return next(new HttpError("Could't upload image to the cloudinary", 422))
      }
      const updateUser = await userModel.findByIdAndUpdate(req.user.id, {profilePhoto: result?.secure_url},{new:true} )
      res.json(updateUser).status(200)
    })
  } catch (error) {
    return next(new HttpError(error));
  }
};

//=======================CHANGE USER PROFILE PHOTO
//POST : api/users/:id/follow-unfollow
//PROTECTED
const followUnfollowUser = async (req, res, next) => {
  try {
    const userToFollowId = req.params.id;
    //Prevent user from following themselves
    if (req.user.id == userToFollowId) {
      return next(new HttpError("You can't follow/unfollow yourself", 422));
    }
    //Now we get data of current user from mongoose
    const currentUser = await userModel.findById(req.user.id);
    const isFollowing = currentUser?.following?.includes(userToFollowId);
    //follow if not following,else unfollow if already following
    if (!isFollowing) {
      const updateUser = await userModel.findByIdAndUpdate(
        userToFollowId,
        { $push: { followers: req.user.id } },
        { new: true }
      );
      //then now we add the followid to current following list
      await userModel.findByIdAndUpdate(
        req.user.id,
        { $push: { following: userToFollowId } },
        { new: true }
      );
      res.json(updateUser);
    } else {
      const updateUser = await userModel.findByIdAndUpdate(
        userToFollowId,
        { $pull: { followers: req.user.id } },
        { new: true }
      );
      await userModel.findByIdAndUpdate(
        req.user.id,
        { $pull: { following: userToFollowId } },
        { new: true }
      );
      res.json(updateUser);
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getUsers,
  editUser,
  followUnfollowUser,
  changeUserAvatar,
};
