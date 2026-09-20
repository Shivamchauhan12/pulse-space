import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import boardReducer from './slices/boardSlice';
import documentReducer from './slices/documentSlice';
import chatReducer from './slices/chatSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    board: boardReducer,
    document: documentReducer,
    chat: chatReducer,
    theme: themeReducer
  }
});
