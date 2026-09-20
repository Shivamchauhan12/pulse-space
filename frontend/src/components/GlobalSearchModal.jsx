import React, { useState } from 'react';
import { Search, X, FileText, Layout, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim() || !currentWorkspace) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/search?workspaceId=${currentWorkspace._id}&query=${encodeURIComponent(val)}`);
      setResults(res.data.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search docs, cards, chat messages..."
            value={query}
            onChange={handleSearch}
            className="w-full bg-transparent border-none text-slate-900 dark:text-white focus:outline-none text-sm placeholder:text-slate-400"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && <div className="text-center py-6 text-slate-400 text-sm">Searching workspace...</div>}

          {results && (
            <>
              {results.documents?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Knowledge Documents
                  </h4>
                  <div className="space-y-1">
                    {results.documents.map((doc) => (
                      <div key={doc._id} className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-2">
                        <span>{doc.icon}</span>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{doc.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.cards?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5" /> Workflow Cards
                  </h4>
                  <div className="space-y-1">
                    {results.cards.map((card) => (
                      <div key={card._id} className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{card.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 font-semibold">{card.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.messages?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat Messages
                  </h4>
                  <div className="space-y-1">
                    {results.messages.map((msg) => (
                      <div key={msg._id} className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                        <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{msg.content}</p>
                        <span className="text-xs text-slate-400">#{msg.channelName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
