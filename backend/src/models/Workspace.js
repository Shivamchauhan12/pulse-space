const mongoose = require('mongoose');

const WorkspaceMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'], default: 'MEMBER' },
  joinedAt: { type: Date, default: Date.now }
});

const WorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [WorkspaceMemberSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workspace', WorkspaceSchema);
