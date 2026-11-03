import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchClientsAPI,
  addClientAPI,
  updateClientAPI,
  deleteClientAPI,
  searchClientsAPI
} from './clientsService'

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchClientsAPI()
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      return await addClientAPI(clientData)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const editClient = createAsyncThunk(
  'clients/editClient',
  async ({ id, updatedFields }, { rejectWithValue }) => {
    try {
      return await updateClientAPI({ id, updatedFields })
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const removeClient = createAsyncThunk(
  'clients/removeClient',
  async (id, { rejectWithValue }) => {
    try {
      await deleteClientAPI(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const searchClients = createAsyncThunk(
  'clients/searchClients',
  async (searchTerm, { rejectWithValue }) => {
    try {
      return await searchClientsAPI(searchTerm)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)
