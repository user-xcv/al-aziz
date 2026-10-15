import { createAsyncThunk } from '@reduxjs/toolkit';
import { createOrderAPI,  } from './orderService'; // fetchOrdersAPI ni to'g'ri chaqiramiz
import { fetchHistoryOrders } from '../history/historyThunk';

// Zakazni bazaga saqlash Thunk'i
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await createOrderAPI(formData);
      
      // MUHIM: Zakaz saqlangandan so'ng, refresh qilmasdan history'ga qo'shish uchun fetchOrders ni chaqiramiz
     dispatch(fetchHistoryOrders());

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
      const data = await fetchOrdersAPI(); 
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);