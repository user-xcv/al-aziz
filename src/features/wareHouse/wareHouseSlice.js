import { createSlice } from '@reduxjs/toolkit'
import {
  fetchWareHouseData,
  addCategory,
  addFormat,
  addMaterial,
  updateMaterial,
  deleteMaterial
} from './wareHouseThunk'

const initialState = {
  categories: [], // Ichida formatlar (formats) array-i bilan
  materials: [],
  isLoading: false,
  error: null
}

const wareHouseSlice = createSlice({
  name: 'wareHouse',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Data
      .addCase(fetchWareHouseData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWareHouseData.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload.categories || []
        state.materials = action.payload.materials || []
      })
      .addCase(fetchWareHouseData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Add Category
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push({ ...action.payload, formats: [] })
      })

      // Add Format
      .addCase(addFormat.fulfilled, (state, action) => {
        const cat = state.categories.find(c => c.id === action.payload.category_id)
        if (cat) {
          if (!cat.formats) cat.formats = []
          cat.formats.push(action.payload)
        }
      })

      // Add Material
      .addCase(addMaterial.fulfilled, (state, action) => {
        state.materials.unshift(action.payload)
      })

      // Update Material
      .addCase(updateMaterial.fulfilled, (state, action) => {
        const index = state.materials.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.materials[index] = action.payload
        }
      })

      // Delete Material
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter(m => m.id !== action.payload)
      })
  }
})

export default wareHouseSlice.reducer