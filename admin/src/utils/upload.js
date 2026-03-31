import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token
const getToken = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  console.log('🔑 Token from storage:', token ? '✅ Found' : '❌ Not found');
  return token;
};

// Upload single image
export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const token = getToken();
  
  console.log('📤 Uploading single image:', imageFile.name);
  console.log('📤 File type:', imageFile.type);
  console.log('📤 File size:', imageFile.size, 'bytes');
  
  try {
    const response = await axios.post(
      `${API_URL}/upload/single`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );

    console.log('✅ Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
};

// Upload multiple images
export const uploadImages = async (imageFiles) => {
  const formData = new FormData();
  
  console.log('📤 Uploading', imageFiles.length, 'images');
  
  // Append all images
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('images', imageFiles[i]);
    console.log('  - Added:', imageFiles[i].name);
  }

  const token = getToken();
  
  try {
    const response = await axios.post(
      `${API_URL}/upload/multiple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );

    console.log('✅ Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    throw error;
  }
};
