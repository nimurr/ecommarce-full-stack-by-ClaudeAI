import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const adminFromStorage = localStorage.getItem('adminUser')
  ? JSON.parse(localStorage.getItem('adminUser'))
  : null;

const initialState = {
  user: adminFromStorage,
  token: localStorage.getItem('adminToken'),
  loading: false,
  error: null,
  isAuthenticated: !!adminFromStorage,
};

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await adminAPI.login(credentials);
      if (data.data.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        return rejectWithValue('Access denied');
      }
      localStorage.setItem('adminToken', data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.data));
      toast.success('Welcome back, Admin!');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  toast.success('Logged out successfully');
  return { type: 'auth/logout' };
};

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
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
