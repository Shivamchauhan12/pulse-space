import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDocuments = createAsyncThunk('document/fetchAll', async (workspaceId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/documents/workspace/${workspaceId}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch documents');
  }
});

export const createDocument = createAsyncThunk('document/create', async (docData, { rejectWithValue }) => {
  try {
    const res = await api.post('/documents', docData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create document');
  }
});

export const updateDocument = createAsyncThunk('document/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/documents/${id}`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update document');
  }
});

const documentSlice = createSlice({
  name: 'document',
  initialState: {
    documents: [],
    activeDocument: null,
    loading: false,
    error: null
  },
  reducers: {
    setActiveDocument: (state, action) => {
      state.activeDocument = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
        if (action.payload.length > 0 && !state.activeDocument) {
          state.activeDocument = action.payload[0];
        }
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
        state.activeDocument = action.payload;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const idx = state.documents.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.documents[idx] = action.payload;
        if (state.activeDocument?._id === action.payload._id) {
          state.activeDocument = action.payload;
        }
      });
  }
});

export const { setActiveDocument } = documentSlice.actions;
export default documentSlice.reducer;
