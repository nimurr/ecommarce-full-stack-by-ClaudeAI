// Base URL for API and Images
export const API_URL = 'https://api.gadgetslagbe.com/api';
export const IMAGE_URL = 'https://gadgetslagbe.com';

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/300x300?text=No+Image';
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // If it starts with /public, prepend the base URL
  if (imagePath.startsWith('/public')) return `https://gadgetslagbe.com${imagePath}`;
  // Otherwise, prepend /public
  return `https://gadgetslagbe.com/public${imagePath}`;
};

export default IMAGE_URL;