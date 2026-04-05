import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, params }, { rejectWithValue }) => {
    try {
      const { data } = await reviewAPI.getProductReviews(productId, params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const { data } = await reviewAPI.createReview(reviewData);
      toast.success('Review submitted successfully!');
      return data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      return reviewId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewAPI.markHelpful(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markNotHelpful = createAsyncThunk(
  'reviews/markNotHelpful',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewAPI.markNotHelpful(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 0,
  ratingDistribution: [],
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.ratingDistribution = action.payload.ratingDistribution;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
        state.total -= 1;
      })
      // Mark helpful
      .addCase(markHelpful.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r._id === action.payload);
        if (review) {
          review.helpful += 1;
        }
      })
      // Mark not helpful
      .addCase(markNotHelpful.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r._id === action.payload);
        if (review) {
          review.notHelpful += 1;
        }
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
