import { createSlice } from '@reduxjs/toolkit';
import { createOrder, fetchOrders } from './orderThunk';

const initialState = {
  ordersList: [],     // Bazadan keladigan zakazlar tarixi
  isLoading: false,   // Yuklanish jarayoni
  error: null,        // Xatoliklar
  successMessage: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Agar holatni tozalash kerak bo'lsa
    clearStatus: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Create Order ---
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.isLoading = false;
        state.successMessage = "Muvaffaqiyatli saqlandi!";
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // --- Fetch Orders (Tarixni olish) ---
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ordersList = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearStatus } = orderSlice.actions;
export default orderSlice.reducer;