const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    fullName: {type:String, required: true},
    email: {type:String, required: true},
    password: {type: String, required:true},
    profilePhoto: {type:String, default: 'https://asset.cloudinary.com/dhtcee0xa/569a36802378b3d8d1d45c23c3d5ce06'},
    bio: {type:String, default: ''},
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: Schema.Types.ObjectId, ref: 'User'}],
    bookmarks: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    posts: [{type: Schema.Types.ObjectId, ref: 'User'}]
},{timestamps:true})

module.exports = model("User" ,userSchema)