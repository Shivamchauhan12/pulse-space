const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    position: { type: Number, required: true, default: 0 },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    storyPoints: { type: Number, default: 1 },
    dueDate: { type: Date },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    checklists: [
      {
        title: { type: String },
        completed: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

const ListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    position: { type: Number, required: true, default: 0 },
    cards: [CardSchema]
  },
  { timestamps: true }
);

const BoardSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    lists: [ListSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', BoardSchema);
