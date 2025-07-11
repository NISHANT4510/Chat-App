import React from 'react'

const ProfileImage = ({image, className}) => {
  return (
    <div className={`profileImage ${className}`}>
       <img src={image}/>
    </div>
  )
}

export default ProfileImage
