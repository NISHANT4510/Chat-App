const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    fullName: {type:String, required: true},
    email: {type:String, required: true},
    password: {type: String, required:true},
    // profilePhoto: {type:String, default: 'https://asset.cloudinary.com/dhtcee0xa/569a36802378b3d8d1d45c23c3d5ce06'},
    profilePhoto: {type:String, default: 'https://res.cloudinary.com/dhtcee0xa/image/upload/v1750174998/Sample_User_Icon_cqida5.png'},
    bio: {type:String, default: 'No bio yet'},
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: Schema.Types.ObjectId, ref: 'User'}],
    bookmarks: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
},{timestamps:true})

module.exports = model("User" ,userSchema)