import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export const validateCoupon = createAsyncThunk(
  'coupon/validate',
  async ({ code, userId, cartTotal }, { rejectWithValue }) => {
    try {
      const { data } = await couponAPI.validateCoupon({ code, userId, cartTotal });
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  validCoupon: null,
  loading: false,
  error: null,
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    clearCoupon: (state) => {
      state.validCoupon = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.validCoupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCoupon } = couponSlice.actions;
export default couponSlice.reducer;
