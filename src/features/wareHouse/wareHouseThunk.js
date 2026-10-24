import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchWareHouseDataAPI,
  addCategoryAPI,
  addFormatAPI,
  addMaterialAPI,
  updateMaterialAPI,
  deleteMaterialAPI
} from './wareHouseService'

// 1. Barcha ma'lumotlarni (Kategoriya, Format, Materiallar) yuklash
export const fetchWareHouseData = createAsyncThunk(
  'wareHouse/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchWareHouseDataAPI()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// 2. Yangi Kategoriya qo'shish
export const addCategory = createAsyncThunk(
  'wareHouse/addCategory',
  async (categoryName, { rejectWithValue }) => {
    try {
      return await addCategoryAPI(categoryName)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// 3. Yangi Format qo'shish
export const addFormat = createAsyncThunk(
  'wareHouse/addFormat',
  async ({ categoryId, formatName }, { rejectWithValue }) => {
    try {
      return await addFormatAPI(categoryId, formatName)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// 4. Material Qo'shish
export const addMaterial = createAsyncThunk(
  'wareHouse/addMaterial',
  async (materialData, { rejectWithValue }) => {
    try {
      return await addMaterialAPI(materialData)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// 5. Materialni Tahrirlash (Edit)
export const updateMaterial = createAsyncThunk(
  'wareHouse/updateMaterial',
  async (payload, { rejectWithValue }) => {
    try {
      return await updateMaterialAPI(payload)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// 6. Materialni O'chirish
export const deleteMaterial = createAsyncThunk(
  'wareHouse/deleteMaterial',
  async (id, { rejectWithValue }) => {
    try {
      return await deleteMaterialAPI(id)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)