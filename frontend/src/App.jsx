import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import { fetchWorkspaces } from './store/slices/workspaceSlice';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OfflineBanner from './components/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import KanbanBoardPage from './pages/KanbanBoardPage';
import KnowledgeDocsPage from './pages/KnowledgeDocsPage';
import ChatStreamsPage from './pages/ChatStreamsPage';

const ProtectedLayout = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMe());
      dispatch(fetchWorkspaces());
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
      <OfflineBanner />
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<WorkspaceDashboard />} />
            <Route path="/kanban" element={<KanbanBoardPage />} />
            <Route path="/docs" element={<KnowledgeDocsPage />} />
            <Route path="/chat" element={<ChatStreamsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
