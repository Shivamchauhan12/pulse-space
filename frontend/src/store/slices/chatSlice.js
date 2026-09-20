import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchChannels = createAsyncThunk('chat/fetchChannels', async (workspaceId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/channels/workspace/${workspaceId}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch channels');
  }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (channelId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/channels/${channelId}/messages`);
    return { channelId, messages: res.data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch messages');
  }
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ channelId, content }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/channels/${channelId}/messages`, { content });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to send message');
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    channels: [],
    activeChannel: null,
    messages: [],
    loading: false
  },
  reducers: {
    setActiveChannel: (state, action) => {
      state.activeChannel = action.payload;
    },
    appendMessage: (state, action) => {
      const { channelId, message } = action.payload;
      if (state.activeChannel?._id === channelId) {
        const exists = state.messages.some((m) => m._id === message._id);
        if (!exists) {
          state.messages.push(message);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.channels = action.payload;
        if (action.payload.length > 0 && !state.activeChannel) {
          state.activeChannel = action.payload[0];
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const exists = state.messages.some((m) => m._id === action.payload._id);
        if (!exists) {
          state.messages.push(action.payload);
        }
      });
  }
});

export const { setActiveChannel, appendMessage } = chatSlice.actions;
export default chatSlice.reducer;
