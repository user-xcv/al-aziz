import { configureStore } from '@reduxjs/toolkit'
import orderReducer from '../features/enterData/orderSlice'
import historyReducer from '../features/history/historySlice'
import wareHouseReducer from '../features/wareHouse/wareHouseSlice' // <-- Ombor reducer'ini import qilamiz

export const store = configureStore({
  reducer: {
    orders: orderReducer,
    history: historyReducer,
    wareHouse: wareHouseReducer, // <-- state.wareHouse bo'lishi uchun buni ulaymiz
  },
})