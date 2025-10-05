import React from 'react'

const ProfileImage = ({image, className}) => {
  return (
    <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700 ${className || ''}`}>
       <img src={image} alt="Profile" className="w-full h-full object-cover" />
    </div>
  )
}

export default ProfileImage
