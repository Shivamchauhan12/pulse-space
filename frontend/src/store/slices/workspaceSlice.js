import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchWorkspaces = createAsyncThunk('workspace/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/workspaces');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch workspaces');
  }
});

export const createWorkspace = createAsyncThunk('workspace/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/workspaces', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create workspace');
  }
});

export const deleteWorkspace = createAsyncThunk('workspace/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/workspaces/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete workspace');
  }
});

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => { state.loading = true; })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.workspaces = action.payload;
        if (action.payload.length > 0 && !state.currentWorkspace) {
          state.currentWorkspace = action.payload[0];
        }
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.push(action.payload);
        state.currentWorkspace = action.payload;
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter((w) => w._id !== action.payload);
        if (state.currentWorkspace?._id === action.payload) {
          state.currentWorkspace = state.workspaces.length > 0 ? state.workspaces[0] : null;
        }
      });
  }
});

export const { setCurrentWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
