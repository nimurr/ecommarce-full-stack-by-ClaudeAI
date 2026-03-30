import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

const tokenFromStorage = localStorage.getItem('token')
  ? localStorage.getItem('token')
  : null;

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  loading: false,
  error: null,
  isAuthenticated: !!tokenFromStorage,
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success('Registration successful!');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(credentials);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success('Login successful!');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  toast.success('Logged out successfully');
  return { type: 'auth/logout' };
};

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.updateDetails(userData);
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...user, ...data.data }));
      toast.success('Profile updated successfully!');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'auth/addToWishlist',
  async (productId, { rejectWithValue, getState }) => {
    try {
      await authAPI.addToWishlist(productId);
      const state = getState();
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedWishlist = [...(user.wishlist || []), productId];
      localStorage.setItem('user', JSON.stringify({ ...user, wishlist: updatedWishlist }));
      toast.success('Added to wishlist!');
      return productId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'auth/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      await authAPI.removeFromWishlist(productId);
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedWishlist = user.wishlist.filter(id => id !== productId);
      localStorage.setItem('user', JSON.stringify({ ...user, wishlist: updatedWishlist }));
      toast.success('Removed from wishlist!');
      return productId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Add to wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (state.user) {
          state.user.wishlist = [...(state.user.wishlist || []), action.payload];
        }
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        if (state.user) {
          state.user.wishlist = state.user.wishlist.filter(id => id !== action.payload);
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
