const HttpError = require("../models/errorModel")
const CommentModel = require("../models/commentModel")
const postModel = require("../models/postModel")
const userModel = require("../models/userModel")
const commentModel = require("../models/commentModel")


//================CREATE COMMENT
//POST : api/comment/:postId
//PROTECTED
const createComment = async (req, res, next) =>{
    try {
        const {postId} = req.params;
        const {comment} = req.body;
        if(!comment) {
            return next(new HttpError("Please write a comment", 422))
        }
        //get comment creator from db
        const commentCreator = await userModel.findById(req.user.id)
        const newComment = await commentModel.create({creator: {creatorId: req.user.id, creatorName: commentCreator?.fullName,creatorPhoto: commentCreator?.profilePhoto},comment,postId})
        await postModel.findByIdAndUpdate(postId, {$push: {comments: newComment?._id}},{new:true})
        res.json(newComment)
    } catch (error) {
        return next(new HttpError)
    }
}


//================GET COMMENT
//GET : api/comment/:commentId
//PROTECTED
const getPostComments = async (req, res, next) =>{
    try {
        const {postId} = req.params;
        const comments = await postModel.findById(postId).populate({path: "comments", options : {sort: {createdAt: -1}}})
        res.json(comments)
    } catch (error) {
        return next(new HttpError)
    }
}



//================DELETE COMMENT
//DELETE : api/comment/:postId
//PROTECTED
const deleteComment = async (req, res, next) =>{
    try {
        const {commentId} = req.params;
        //get the comment from db
        const comment = await commentModel.findById(commentId);
        const commentCreator = await userModel.findById(comment?.creator?.creatorId)
        //check if the creator is the one performing the deletion
        if(commentCreator?._id != req.user.id){
            return next (new HttpError("Unauthorized action", 403))
        }
        //remove comment id from post comments array
        await postModel.findByIdAndUpdate(comment?.postId,{$pull:{comments: commentId}})
        const deletedComment = await commentModel.findByIdAndDelete(commentId)
        res.json(deletedComment)
    } catch (error) {
        return next(new HttpError)
    }
}

module.exports = {createComment,getPostComments,deleteComment}