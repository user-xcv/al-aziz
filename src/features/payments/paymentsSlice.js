import { createSlice } from '@reduxjs/toolkit'
import {
  fetchPayments,
  createPayment,
  editPayment,
  removePayment
} from './paymentsThunk'

const initialState = {
  payments: [],
  isLoading: false,
  error: null
}

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Payments
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.payments = action.payload
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Payment
      .addCase(createPayment.fulfilled, (state, action) => {
        state.payments.unshift(action.payload)
      })

      // Edit Payment
      .addCase(editPayment.fulfilled, (state, action) => {
        const index = state.payments.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.payments[index] = action.payload
        }
      })

      // Remove Payment
      .addCase(removePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter(p => p.id !== action.payload)
      })
  }
})

export default paymentsSlice.reducer
