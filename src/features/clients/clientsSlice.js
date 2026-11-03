import { createSlice } from '@reduxjs/toolkit'
import {
  fetchClients,
  createClient,
  editClient,
  removeClient,
  searchClients
} from './clientsThunk'

const initialState = {
  clients: [],
  isLoading: false,
  error: null
}

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false
        state.clients = action.payload
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Create Client
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.unshift(action.payload)
      })

      // Edit Client
      .addCase(editClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.clients[index] = action.payload
        }
      })

      // Remove Client
      .addCase(removeClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(c => c.id !== action.payload)
      })

      // Search Clients
      .addCase(searchClients.fulfilled, (state, action) => {
        state.clients = action.payload
      })
  }
})

export default clientsSlice.reducer
