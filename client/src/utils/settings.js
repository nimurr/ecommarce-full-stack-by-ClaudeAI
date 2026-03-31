import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get website settings
export const getSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
};

// Get contact settings
export const getContactSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/contact`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch contact settings:', error);
    return null;
  }
};

// Get shipping settings
export const getShippingSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/shipping`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch shipping settings:', error);
    return null;
  }
};
