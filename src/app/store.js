import { configureStore } from '@reduxjs/toolkit';
import orderReducer from '../features/enterData/orderSlice';
import historyReducer from '../features/history/historySlice'; // <-- Qo'shdik

export const store = configureStore({
  reducer: {
    orders: orderReducer,
    history: historyReducer, // <-- Qo'shdik
  },
});