import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const testimonialAPI = {
  getTestimonials: async (limit = 10) => {
    const response = await axios.get(`${API_URL}/testimonials?limit=${limit}&featured=false`);
    return response.data;
  },
  getFeaturedTestimonials: async (limit = 6) => {
    const response = await axios.get(`${API_URL}/testimonials?limit=${limit}&featured=true`);
    return response.data;
  },
};
