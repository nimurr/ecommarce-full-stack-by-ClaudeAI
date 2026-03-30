import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import categoryReducer from './slices/categorySlice';
import userReducer from './slices/userSlice';
import reviewReducer from './slices/reviewSlice';
import couponReducer from './slices/couponSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productReducer,
    orders: orderReducer,
    categories: categoryReducer,
    users: userReducer,
    reviews: reviewReducer,
    coupons: couponReducer,
  },
});

export default store;
