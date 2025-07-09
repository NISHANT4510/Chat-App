import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { FaRegHeart } from 'react-icons/fa'
import { FcLike } from 'react-icons/fc'

const LikeDislikePost = (props) => {
const [post, setPost] = useState(props.post)
const userId = useSelector(state => state?.user?.currentUser?.id)
const token = useSelector(state => state?.user?.currentUser?.token)
const [postLiked, setPostLiked] = useState(post?.likes?.includes?.userId)

const handleLikeDislikePost = async () =>{
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${post?._id}/like`, {withCredentials : true, headers: {Authorization: `Bearer ${token}`}})
    setPost(response?.data)
  } catch (error) {
    console.log(error)
  }
}

//FUNCTION TO CHECK POST IS LIKED OR NOT
const handleCheckIfUserLikedPost = () =>{
  if(post?.likes?.includes(userId)){
    setPostLiked(true)
  } else{
    setPostLiked(false)
  }
}

useEffect(()=>{
  handleCheckIfUserLikedPost()
},[post])

  return (
   <button className='feed__footer-comments' onClick={handleLikeDislikePost}>
    {postLiked ? <FcLike/> : <FaRegHeart/>}
    <small>{post?.likes?.length}</small>
   </button>
  )
}

export default LikeDislikePost
