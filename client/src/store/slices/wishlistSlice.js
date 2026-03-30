import { createSlice } from '@reduxjs/toolkit';
import { addToWishlist, removeFromWishlist } from './authSlice';

const wishlistFromStorage = localStorage.getItem('wishlist')
  ? JSON.parse(localStorage.getItem('wishlist'))
  : [];

const initialState = {
  items: wishlistFromStorage,
  loading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('wishlist', JSON.stringify(action.payload));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.items.includes(action.payload)) {
          state.items.push(action.payload);
          localStorage.setItem('wishlist', JSON.stringify(state.items));
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(id => id !== action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      });
  },
});

export const { setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
