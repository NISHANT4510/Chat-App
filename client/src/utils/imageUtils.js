// Helper function to get secure image URL
export const getSecureImageUrl = (imageUrl) => {
  if (!imageUrl) return DEFAULT_AVATAR;

  // Handle malformed Cloudinary URLs
  if (typeof imageUrl === 'string' && imageUrl.includes('cloudinary.com')) {
    try {
      // Extract the actual path from malformed URLs
      const cloudinaryPattern = /cloudinary\.com\/[^\/]+\/(.+)/;
      const match = imageUrl.match(cloudinaryPattern);
      
      if (match && match[1]) {
        return `https://res.cloudinary.com/dhtcee0xa/${match[1]}`;
      }
      
      // If URL is already correct, just ensure it's using HTTPS
      if (imageUrl.startsWith('http:')) {
        return imageUrl.replace('http:', 'https:');
      }
      
      // If it's already a proper HTTPS URL, return it
      if (imageUrl.startsWith('https://')) {
        return imageUrl;
      }
    } catch (error) {
      console.error('Invalid Cloudinary URL:', imageUrl, error);
      return DEFAULT_AVATAR;
    }
  }

  // Generate avatar for users without images
  return `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name || 'User')}`;
};

// Default avatar URL
export const DEFAULT_AVATAR = 'https://res.cloudinary.com/dhtcee0xa/image/upload/v1750174998/Sample_User_Icon_cqida5.png';