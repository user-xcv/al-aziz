import { createSlice } from '@reduxjs/toolkit';
import { fetchHistoryOrders, deleteHistoryOrder } from './historyThunk';

const initialState = {
  historyList: [],
  isLoading: false,
  error: null,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHistoryOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHistoryOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.historyList = action.payload;
      })
      .addCase(fetchHistoryOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteHistoryOrder.fulfilled, (state, action) => {
        state.historyList = state.historyList.filter(item => item.id !== action.payload);
      });
  },
});

export default historySlice.reducer;