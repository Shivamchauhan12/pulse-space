import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createWorkspace, deleteWorkspace } from '../store/slices/workspaceSlice';
import { Plus, Users, Kanban, FileText, MessageSquare, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const WorkspaceDashboard = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { user } = useSelector((state) => state.auth);

  const [newWsName, setNewWsName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = currentWorkspace?.owner?._id === user?.id || currentWorkspace?.owner === user?.id;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    dispatch(createWorkspace({ name: newWsName, description: 'Engineering and Product Workspace' })).then(() => {
      setNewWsName('');
      setShowModal(false);
    });
  };

  const handleDelete = () => {
    if (!currentWorkspace?._id) return;
    dispatch(deleteWorkspace(currentWorkspace._id)).then(() => {
      setShowDeleteModal(false);
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>{currentWorkspace?.name || 'Workspace Dashboard'}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Active Tenant
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {currentWorkspace?.description || 'Unified engineering hub for tasks, specs, and stream huddles.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentWorkspace && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 dark:text-rose-400 border border-rose-500/20 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
              title="Delete current workspace"
            >
              <Trash2 className="w-4 h-4" /> Delete Workspace
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-brand-600/20"
          >
            <Plus className="w-4 h-4" /> Create Workspace
          </button>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/kanban"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 transition group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <Kanban className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Workflow Boards</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trello-inspired Kanban drag-and-drop pipelines with story points and priority tracking.
          </p>
        </Link>

        <Link
          to="/docs"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 transition group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Knowledge Hub</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Notion-style structured block notes, technical specs, and team SOP documentation.
          </p>
        </Link>

        <Link
          to="/chat"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 transition group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Stream Sync</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Slack-style real-time channels with live typing indicators and instant socket messages.
          </p>
        </Link>
      </div>

      {/* Members Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-500" /> Workspace Team Members & Roles
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {currentWorkspace?.members?.map((m) => (
            <div key={m.user?._id || m._id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center">
                  {m.user?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{m.user?.name || 'Member'}</p>
                  <p className="text-[10px] text-slate-400">{m.user?.email}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-500 dark:text-brand-400 border border-slate-200 dark:border-slate-700">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Workspace</h3>
            <input
              type="text"
              placeholder="e.g. Mobile Engineering Team"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button onClick={handleCreate} className="px-4 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Workspace Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-rose-500">Delete Workspace?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{currentWorkspace?.name}"</strong>? This will permanently remove all associated boards, documents, channels, and audit history. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDashboard;
