import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get page by slug
export const getPageBySlug = async (slug) => {
  try {
    const response = await axios.get(`${API_URL}/pages/slug/${slug}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch page');
  }
};

// Get all navigation pages (for footer/menu)
export const getNavigationPages = async () => {
  try {
    const response = await axios.get(`${API_URL}/pages/navigation`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch navigation pages:', error);
    return null;
  }
};

// Get pages by type
export const getPagesByType = async (type) => {
  try {
    const response = await axios.get(`${API_URL}/pages/type/${type}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pages by type:', error);
    return null;
  }
};
