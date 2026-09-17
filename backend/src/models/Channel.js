const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String }
      }
    ],
    reactions: [
      {
        emoji: { type: String },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      }
    ]
  },
  { timestamps: true }
);

const ChannelSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isPrivate: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [MessageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Channel', ChannelSchema);
