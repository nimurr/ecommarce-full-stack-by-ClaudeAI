import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchCoupons = createAsyncThunk(
  'coupons/fetchCoupons',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await adminAPI.getCoupons(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createCoupon = createAsyncThunk(
  'coupons/create',
  async (data, { rejectWithValue }) => {
    try {
      const { data: result } = await adminAPI.createCoupon(data);
      toast.success('Coupon created');
      return result.data;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateCoupon = createAsyncThunk(
  'coupons/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: result } = await adminAPI.updateCoupon(id, data);
      toast.success('Coupon updated');
      return result.data;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupons/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteCoupon(id);
      toast.success('Coupon deleted');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  coupons: [],
  loading: false,
  error: null,
  total: 0,
};

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const index = state.coupons.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.coupons[index] = action.payload;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c._id !== action.payload);
      });
  },
});

export default couponSlice.reducer;
