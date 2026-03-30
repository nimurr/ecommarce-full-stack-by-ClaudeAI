import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryAPI } from '../../utils/api';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await categoryAPI.getCategories(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCategoryTree = createAsyncThunk(
  'categories/fetchCategoryTree',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await categoryAPI.getCategoryTree();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  'categories/fetchCategoryBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await categoryAPI.getCategoryBySlug(slug);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchFeaturedCategories = createAsyncThunk(
  'categories/fetchFeaturedCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await categoryAPI.getFeaturedCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  categories: [],
  categoryTree: [],
  category: null,
  featuredCategories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategory: (state) => {
      state.category = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch category tree
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryTree = action.payload.data;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch category by slug
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload.data;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch featured categories
      .addCase(fetchFeaturedCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeaturedCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredCategories = action.payload.data;
      })
      .addCase(fetchFeaturedCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCategory } = categorySlice.actions;
export default categorySlice.reducer;
