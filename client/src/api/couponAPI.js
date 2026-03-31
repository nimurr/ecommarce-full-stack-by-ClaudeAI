import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get homepage coupon
export const getHomepageCoupon = async () => {
  try {
    const response = await axios.get(`${API_URL}/coupons/homepage`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch homepage coupon:', error);
    return null;
  }
};

// Validate coupon
export const validateCoupon = async (code, userId, cartTotal) => {
  try {
    const response = await axios.post(`${API_URL}/coupons/validate`, {
      code,
      userId,
      cartTotal,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to validate coupon');
  }
};
