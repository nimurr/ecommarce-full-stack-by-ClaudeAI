import { createSlice } from '@reduxjs/toolkit';

const cartFromStorage = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : [];

const initialState = {
  cartItems: cartFromStorage,
  shippingAddress: {},
  paymentMethod: 'COD',
  couponCode: null,
  discount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => 
        x.product === item.product && 
        x.selectedColor === item.selectedColor && 
        x.selectedSize === item.selectedSize
      );

      if (existItem) {
        // Update quantity if item already exists (same product, color, size)
        existItem.quantity = (existItem.quantity || 0) + (item.quantity || 1);
      } else {
        // Add new item
        state.cartItems = [...state.cartItems, {
          ...item,
          quantity: item.quantity || 1,
        }];
      }

      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.product !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.cartItems));
    },
    updateQuantity: (state, action) => {
      const { product, quantity, selectedColor, selectedSize } = action.payload;
      const item = state.cartItems.find((x) => 
        x.product === product && 
        x.selectedColor === selectedColor && 
        x.selectedSize === selectedSize
      );
      if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(state.cartItems));
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cart');
    },
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setCoupon: (state, action) => {
      state.couponCode = action.payload.code;
      state.discount = action.payload.discount;
    },
    clearCoupon: (state) => {
      state.couponCode = null;
      state.discount = 0;
    },
    loadShippingAddress: (state) => {
      const savedAddress = localStorage.getItem('shippingAddress');
      if (savedAddress) {
        state.shippingAddress = JSON.parse(savedAddress);
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setShippingAddress,
  setPaymentMethod,
  setCoupon,
  clearCoupon,
  loadShippingAddress,
} = cartSlice.actions;

// Selectors
export const selectCartTotal = (state) => {
  const cart = state.cart.cartItems;
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 1000 ? 0 : 60;
  const discount = state.cart.discount;
  return {
    subtotal,
    shipping,
    discount,
    total: subtotal + shipping - discount,
  };
};

export const selectCartCount = (state) => {
  return state.cart.cartItems.reduce((acc, item) => acc + item.quantity, 0);
};

export default cartSlice.reducer;
