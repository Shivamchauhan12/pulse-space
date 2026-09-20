import React, { useState } from 'react';
import { Search, Moon, Sun, BarChart3, LogOut, Shield } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/slices/themeSlice';
import { logout } from '../store/slices/authSlice';
import GlobalSearchModal from './GlobalSearchModal';
import AnalyticsModal from './AnalyticsModal';

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const { currentWorkspace } = useSelector((state) => state.workspace);

  const [searchOpen, setSearchOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-dark-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
            <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-md">P</span>
            <span>PulseSpace</span>
          </div>
          {currentWorkspace && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-700">
              <Shield className="w-3.5 h-3.5" /> {currentWorkspace.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search (Ctrl+K)...</span>
          </button>

          <button
            onClick={() => setAnalyticsOpen(true)}
            className="p-2 text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Workspace Analytics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Theme"
          >
            {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
              {user?.name?.[0] || 'U'}
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AnalyticsModal isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
    </>
  );
};

export default Navbar;
