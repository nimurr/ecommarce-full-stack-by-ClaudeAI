import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginWithPhone: (data) => api.post('/auth/login-phone', data),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
  getWishlist: () => api.get('/auth/wishlist'),
  addToWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/auth/wishlist/${productId}`),
};

// Product APIs
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getFeaturedProducts: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getSearchSuggestions: (q) => api.get('/products/search/suggestions', { params: { q } }),
};

// Category APIs
export const categoryAPI = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategoryTree: () => api.get('/categories/tree'),
  getCategory: (id) => api.get(`/categories/${id}`),
  getCategoryBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  getFeaturedCategories: () => api.get('/categories/featured'),
};

// Order APIs
export const orderAPI = {
  getMyOrders: (params) => api.get('/orders/myorders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getOrderByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  createOrder: (data) => api.post('/orders', data),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
  trackOrder: (id) => api.get(`/orders/${id}/track`),
};

// Review APIs
export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  markNotHelpful: (id) => api.post(`/reviews/${id}/not-helpful`),
};

// Coupon APIs
export const couponAPI = {
  validateCoupon: (data) => api.post('/coupons/validate', data),
};

// User APIs
export const userAPI = {
  getDashboardStats: () => api.get('/users/stats/dashboard'),
};

export default api;
