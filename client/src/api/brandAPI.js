import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get featured brands (for homepage)
export const getFeaturedBrands = async (limit = 12) => {
  try {
    const response = await axios.get(`${API_URL}/brands/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch featured brands:', error);
    return null;
  }
};

// Get all brands
export const getAllBrands = async () => {
  try {
    const response = await axios.get(`${API_URL}/brands?limit=100`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all brands:', error);
    return null;
  }
};

// Get brand by slug
export const getBrandBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_URL}/brands/slug/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch brand');
  }
};
