import { configureStore } from '@reduxjs/toolkit'
import orderReducer from '../features/enterData/orderSlice'
import historyReducer from '../features/history/historySlice'
import wareHouseReducer from '../features/wareHouse/wareHouseSlice'
import clientsReducer from '../features/clients/clientsSlice'
import paymentsReducer from '../features/payments/paymentsSlice'

export const store = configureStore({
  reducer: {
    orders: orderReducer,
    history: historyReducer,
    wareHouse: wareHouseReducer,
    clients: clientsReducer,
    payments: paymentsReducer,
  },
})