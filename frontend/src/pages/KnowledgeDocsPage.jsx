import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDocuments, createDocument, updateDocument, setActiveDocument } from '../store/slices/documentSlice';
import { Plus, FileText, Save, CheckSquare, Code, Heading } from 'lucide-react';

const KnowledgeDocsPage = () => {
  const dispatch = useDispatch();
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const { documents, activeDocument } = useSelector((state) => state.document);

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      dispatch(fetchDocuments(currentWorkspace._id));
    }
  }, [currentWorkspace, dispatch]);

  useEffect(() => {
    if (activeDocument) {
      setTitle(activeDocument.title || '');
      setBlocks(activeDocument.blocks || []);
    }
  }, [activeDocument]);

  const handleCreateDoc = () => {
    if (!currentWorkspace) return;
    dispatch(
      createDocument({
        workspaceId: currentWorkspace._id,
        title: 'Untitled Spec',
        icon: '📝',
        blocks: [
          { id: 'b1', type: 'h1', content: 'Untitled Spec' },
          { id: 'b2', type: 'paragraph', content: 'Write technical architecture, SOPs, or project notes here...' }
        ]
      })
    );
  };

  const handleSaveDoc = () => {
    if (!activeDocument) return;
    setSaving(true);
    dispatch(updateDocument({ id: activeDocument._id, data: { title, blocks } })).then(() => {
      setSaving(false);
    });
  };

  const handleBlockChange = (index, content) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], content };
    setBlocks(updated);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Document Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knowledge Hub</h3>
            <button
              onClick={handleCreateDoc}
              className="p-1 text-slate-400 hover:text-brand-500 rounded-lg transition"
              title="New Document"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {documents.map((doc) => (
              <button
                key={doc._id}
                onClick={() => dispatch(setActiveDocument(doc))}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  activeDocument?._id === doc._id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{doc.icon || '📝'}</span>
                <span className="truncate">{doc.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Document Block Editor */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-6">
        {activeDocument ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-3xl font-black bg-transparent border-none text-slate-900 dark:text-white focus:outline-none w-full"
                placeholder="Document Title"
              />
              <button
                onClick={handleSaveDoc}
                disabled={saving}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow shrink-0"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Block Items */}
            <div className="space-y-4">
              {blocks.map((block, idx) => (
                <div key={block.id || idx} className="group relative flex items-start gap-3">
                  {block.type === 'h1' ? (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      className="text-xl font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none w-full border-b border-transparent focus:border-brand-500 py-1"
                    />
                  ) : (
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 w-full resize-none font-mono"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            Select or create a document to start editing.
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeDocsPage;
