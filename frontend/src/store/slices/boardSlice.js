import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBoards = createAsyncThunk('board/fetchBoards', async (workspaceId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/boards/workspace/${workspaceId}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch boards');
  }
});

export const createBoard = createAsyncThunk('board/createBoard', async (boardData, { rejectWithValue }) => {
  try {
    const res = await api.post('/boards', boardData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create board');
  }
});

export const addCardToList = createAsyncThunk('board/addCard', async ({ boardId, listId, cardData }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/boards/${boardId}/lists/${listId}/cards`, cardData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to add card');
  }
});

export const moveCardOptimistic = createAsyncThunk('board/moveCard', async ({ boardId, sourceListId, targetListId, cardId, newPosition }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/boards/${boardId}/cards/move`, { sourceListId, targetListId, cardId, newPosition });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to persist card move');
  }
});

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    boards: [],
    currentBoard: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    // Immediate Optimistic UI card movement state mutation
    optimisticMoveCard: (state, action) => {
      const { sourceListId, targetListId, cardId, newPosition } = action.payload;
      if (!state.currentBoard) return;

      const sourceList = state.currentBoard.lists.find((l) => l._id === sourceListId);
      const targetList = state.currentBoard.lists.find((l) => l._id === targetListId);
      if (!sourceList || !targetList) return;

      const cardIndex = sourceList.cards.findIndex((c) => c._id === cardId);
      if (cardIndex === -1) return;

      const [movedCard] = sourceList.cards.splice(cardIndex, 1);
      targetList.cards.splice(newPosition, 0, movedCard);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => { state.loading = true; })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
        if (action.payload.length > 0 && !state.currentBoard) {
          state.currentBoard = action.payload[0];
        }
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
        state.currentBoard = action.payload;
      })
      .addCase(addCardToList.fulfilled, (state, action) => {
        state.currentBoard = action.payload;
      })
      .addCase(moveCardOptimistic.fulfilled, (state, action) => {
        state.currentBoard = action.payload;
      });
  }
});

export const { setCurrentBoard, optimisticMoveCard } = boardSlice.actions;
export default boardSlice.reducer;
