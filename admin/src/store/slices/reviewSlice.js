import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await adminAPI.getReviews(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveReview = createAsyncThunk(
  'reviews/approve',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.approveReview(id);
      toast.success('Review approved');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteReview(id);
      toast.success('Review deleted');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message);
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  total: 0,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveReview.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r._id === action.payload);
        if (review) review.approved = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      });
  },
});

export default reviewSlice.reducer;
