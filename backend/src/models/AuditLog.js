const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. WORKSPACE_CREATED, CARD_MOVED, MEMBER_INVITED
    entity: { type: String, required: true }, // e.g. BOARD, CARD, DOC, CHANNEL, MEMBER
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
