import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import Feed from '../components/Feed'
import axios from 'axios'
import FeedSkeleton from '../components/FeedSkeleton';
import HeaderInfo from '../components/HeaderInfo';


const Bookmarks = () => {

const [bookmarks, setBookmarks] =useState([])
const [isLoading, setIsLoading] =useState(false);
const token = useSelector(state => state?.user?.currentUser?.token)

//GET BOOKMARKS OF LOGGED IN USER
const getBookmarks = async () =>{
  setIsLoading(true)
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/bookmarks`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
    setBookmarks(response?.data?.bookmarks)
  } catch (error) {
    console.log(error)
  }
  setIsLoading(false)
}

useEffect(()=>{
getBookmarks()
},[])

  return (
    <section>
      <HeaderInfo text='My Bookmarks'/>
      {isLoading ? <FeedSkeleton/> : bookmarks?.length < 1 ? <p className='center'>No posts bookmarked</p> : bookmarks?. map(bookmark => <Feed key={bookmark?._id} post={bookmark}/>)}
    </section>
  )
}

export default Bookmarks
