import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchPaymentsAPI,
  addPaymentAPI,
  updatePaymentAPI,
  deletePaymentAPI
} from './paymentsService'

export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPaymentsAPI()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      return await addPaymentAPI(paymentData)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const editPayment = createAsyncThunk(
  'payments/editPayment',
  async ({ id, updatedFields }, { rejectWithValue }) => {
    try {
      return await updatePaymentAPI({ id, updatedFields })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const removePayment = createAsyncThunk(
  'payments/removePayment',
  async (id, { rejectWithValue }) => {
    try {
      await deletePaymentAPI(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)
