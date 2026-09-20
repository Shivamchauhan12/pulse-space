import React, { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, MessageSquare, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const AnalyticsModal = ({ isOpen, onClose }) => {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isOpen && currentWorkspace) {
      api.get(`/workspaces/${currentWorkspace._id}/analytics`).then((res) => setData(res.data.data));
    }
  }, [isOpen, currentWorkspace]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Workspace Aggregation Analytics</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <Users className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{data.totalMembers}</span>
                <p className="text-xs text-slate-400 font-medium">Active Members</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <FileText className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{data.totalDocs}</span>
                <p className="text-xs text-slate-400 font-medium">Docs & SOPs</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <MessageSquare className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{data.totalChannels}</span>
                <p className="text-xs text-slate-400 font-medium">Active Channels</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-slate-400 uppercase tracking-wider">Card Breakdown by Priority (Aggregated)</h4>
              <div className="space-y-2">
                {data.cardBreakdown?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Priority: {item._id || 'Unassigned'}</span>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-slate-400">{item.count} Cards</span>
                      <span className="text-brand-400">{item.totalStoryPoints} Story Points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">Loading MongoDB Aggregation Metrics...</div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModal;
