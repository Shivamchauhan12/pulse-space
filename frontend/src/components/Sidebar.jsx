import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Kanban, FileText, MessageSquare, Layers } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace } from '../store/slices/workspaceSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/kanban', label: 'Workflow Board', icon: Kanban },
    { to: '/docs', label: 'Knowledge Hub', icon: FileText },
    { to: '/chat', label: 'Stream Sync', icon: MessageSquare }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-dark-border bg-white dark:bg-slate-900/50 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Workspace Selector */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">Workspace</label>
          <div className="relative">
            <select
              value={currentWorkspace?._id || ''}
              onChange={(e) => {
                const selected = workspaces.find((w) => w._id === e.target.value);
                if (selected) dispatch(setCurrentWorkspace(selected));
              }}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
            >
              {workspaces.map((ws) => (
                <option key={ws._id} value={ws._id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">Navigation</label>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
        <Layers className="w-5 h-5 text-brand-500 mx-auto mb-1" />
        <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">PulseSpace SaaS v1.0</span>
        <span className="text-[10px] text-slate-400">Enterprise Edition</span>
      </div>
    </aside>
  );
};

export default Sidebar;
