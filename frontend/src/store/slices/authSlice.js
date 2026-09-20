import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to load profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
