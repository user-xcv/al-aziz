import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../api/supabase'
import { fetchWareHouseData } from '../wareHouse/wareHouseThunk'
import {
  createInventorySaleAPI,
  fetchInventorySalesAPI,
  recordInventorySalePaymentAPI,
} from './inventorySalesService'

const errorMessage = (error) => error?.message || String(error || 'Noma’lum xatolik')

export const fetchInventorySales = createAsyncThunk(
  'inventorySales/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchInventorySalesAPI(supabase)
    } catch (error) {
      return rejectWithValue(errorMessage(error))
    }
  },
)

export const createInventorySale = createAsyncThunk(
  'inventorySales/create',
  async (saleData, { dispatch, rejectWithValue }) => {
    try {
      const result = await createInventorySaleAPI(saleData, supabase)
      dispatch(fetchInventorySales())
      dispatch(fetchWareHouseData())
      return result
    } catch (error) {
      return rejectWithValue(errorMessage(error))
    }
  },
)

export const recordInventorySalePayment = createAsyncThunk(
  'inventorySales/recordPayment',
  async (paymentData, { dispatch, rejectWithValue }) => {
    try {
      const result = await recordInventorySalePaymentAPI(paymentData, supabase)
      dispatch(fetchInventorySales())
      return result
    } catch (error) {
      return rejectWithValue(errorMessage(error))
    }
  },
)
