import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uiSliceActions } from '../store/ui-slice'

const EditPostModal = ({onUpdatePost}) => {
  const editPostId = useSelector(state => state?.ui?.editPostId)
  const token = useSelector(state => state?.user?.currentUser?.token)
  const [body, setBody] = useState("")

  const dispatch = useDispatch()

//GET POST TO UPDATE
const getPost = async () =>{
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/post/${editPostId}`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}});
        setBody(response?.data?.body)
    } catch (error) {
        console.log(error)
    }
}  

useEffect(()=>{
    getPost()
}, [])

const updatePost = async () => {
 const postData = new FormData();
 postData.set("body", body);
 onUpdatePost(postData, editPostId)
 dispatch(uiSliceActions?.closeEditPostModal())
}

const closeEditPostModal =  (e) =>{
    if(e.target.classList.contains('editPost')) {
        dispatch(uiSliceActions?.closeEditPostModal())
    }
}


  return (
    <form className='editPost' onSubmit={updatePost} onClick={closeEditPostModal}>
        <div className='editPost__container'>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='Write something...' autoFocus />
            <button type='submit' className='btn primary'>Update Post</button>    
        </div>
    </form>
  )
}

export default EditPostModal
