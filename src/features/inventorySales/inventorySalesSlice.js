import { createSlice } from '@reduxjs/toolkit'
import {
  createInventorySale,
  fetchInventorySales,
  recordInventorySalePayment,
} from './inventorySalesThunk'

const initialState = {
  sales: [],
  isLoading: false,
  isSaving: false,
  paymentSavingFor: null,
  error: null,
}

const inventorySalesSlice = createSlice({
  name: 'inventorySales',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventorySales.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInventorySales.fulfilled, (state, action) => {
        state.isLoading = false
        state.sales = action.payload
      })
      .addCase(fetchInventorySales.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createInventorySale.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(createInventorySale.fulfilled, (state) => {
        state.isSaving = false
      })
      .addCase(createInventorySale.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
      .addCase(recordInventorySalePayment.fulfilled, (state) => {
        state.error = null
        state.paymentSavingFor = null
      })
      .addCase(recordInventorySalePayment.pending, (state, action) => {
        state.error = null
        state.paymentSavingFor = action.meta.arg.sale_id
      })
      .addCase(recordInventorySalePayment.rejected, (state, action) => {
        state.error = action.payload
        state.paymentSavingFor = null
      })
  },
})

export default inventorySalesSlice.reducer
