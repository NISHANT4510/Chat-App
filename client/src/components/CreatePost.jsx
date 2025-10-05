import React, { useState } from 'react';
import ProfileImage from './ProfileImage';
import { useSelector } from 'react-redux';
import { SlPicture } from 'react-icons/sl';
import { X } from 'lucide-react';

const CreatePost = ({ onCreatePost, error }) => {
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const profilePhoto = useSelector(state => state?.user?.currentUser?.profilePhoto);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const createPost = (e) => {
    e.preventDefault();
    const postData = new FormData();
    postData.set('body', body);
    if (image) {
      postData.set('image', image);
    }
    onCreatePost(postData);
    setBody("");
    setImage(null);
    setImagePreview("");
  };

  return (
    <form 
      className='bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 lg:p-5 mb-4' 
      encType='multipart/form-data' 
      onSubmit={createPost}
    >
      {error && (
        <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm'>
          {error}
        </div>
      )}

      <div className='flex gap-3 mb-4'>
        <ProfileImage image={profilePhoto} />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What's on your mind?"
          className='flex-1 resize-none border-none outline-none bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all min-h-[80px]'
          rows={3}
        />
      </div>

      {imagePreview && (
        <div className='mb-4 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800'>
          <img 
            src={imagePreview} 
            alt="Preview" 
            className='w-full max-h-96 object-contain'
          />
          <button
            type="button"
            onClick={removeImage}
            className='absolute top-2 right-2 p-2 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full transition-all'
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
        <label 
          htmlFor="image" 
          className='flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-all text-sm font-medium'
        >
          <SlPicture className="text-lg text-blue-600 dark:text-blue-500" />
          <span>Photo</span>
        </label>
        <input 
          type="file" 
          id='image' 
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        <button 
          type='submit'
          disabled={!body.trim() && !image}
          className='px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow disabled:shadow-none'
        >
          Post
        </button>
      </div>
    </form>
  );
};

export default CreatePost;
