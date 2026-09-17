const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['h1', 'h2', 'paragraph', 'bullet', 'code', 'callout', 'todo'], default: 'paragraph' },
  content: { type: String, default: '' },
  checked: { type: Boolean, default: false }
});

const DocumentSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: '📝' },
    parentDoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blocks: [BlockSchema],
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
