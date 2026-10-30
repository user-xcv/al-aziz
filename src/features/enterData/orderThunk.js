import { createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderAPI } from './orderService';
import { fetchHistoryOrders } from '../history/historyThunk';
import { fetchHistoryAPI } from '../history/historyService';
import { fetchWareHouseData } from '../wareHouse/wareHouseThunk';

// Zakazni bazaga saqlash Thunk'i
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await createOrderAPI(formData);
      dispatch(fetchHistoryOrders());
      dispatch(fetchWareHouseData());
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Tarixni bazadan olib kelish Thunk'i
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      // Bu yerda orderService dagi API funksiya chaqirilishi kerak (rekursiya bo'lmasligi uchun)
      const data = await fetchHistoryAPI();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);