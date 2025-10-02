import React, { useEffect, useState } from 'react'
import {useSelector} from 'react-redux'
import axios from 'axios'
import FriendRequest from './FriendRequest'

const FriendRequests = () => {
    const [friends, setFriends] = useState([])

    const userId = useSelector(state => state?.user?.currentUser?.id)
    const token = useSelector(state => state?.user?.currentUser?.token)


//GET PEOPLE FROM DB
const getFriends = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
          withCredentials: true, 
          headers: {Authorization: `Bearer ${token}`}
        });
        
        const userData = response.data?.users || response.data || [];
        if (Array.isArray(userData)) {
          const people = userData.filter(person => 
            person && person._id !== userId && !person.followers?.includes(userId)
          );
          setFriends(people);
        } else {
          setFriends([]);
        }
    } catch (error) {
        console.error('Error fetching friends:', error);
        setFriends([]);
    }
}    


useEffect(() =>{
     getFriends()
}, [])


const closeFriendBadge = (id) => {
  setFriends(friends?.filter(friend => {
    if(friend?._id != id) {
      return friend;
    }
  }))
}

  return (
   <menu className='friendRequests'>
     <h3>Suggested Friends</h3>
     {
      friends?.map(friend => <FriendRequest key={friend?._id} friend={friend} onFilterFriend={closeFriendBadge} />)
     }
   </menu>
  )
}

export default FriendRequests
