import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHistoryAPI, deleteHistoryAPI } from './historyService';

export const fetchHistoryOrders = createAsyncThunk(
  'history/fetchHistoryOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchHistoryAPI();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// O'chirish uchun thunk
export const deleteHistoryOrder = createAsyncThunk(
  'history/deleteHistoryOrder',
  async (id, { rejectWithValue }) => {
    try {
      await deleteHistoryAPI(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);