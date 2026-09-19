const Channel = require('../models/Channel');
const AuditLog = require('../models/AuditLog');
const { getIO } = require('../services/socket.service');

const getWorkspaceChannels = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const channels = await Channel.find({ workspace: workspaceId })
      .populate('members', 'name email avatar isOnline')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: channels });
  } catch (err) {
    next(err);
  }
};

const createChannel = async (req, res, next) => {
  try {
    const { workspaceId, name, description, isPrivate } = req.body;
    if (!workspaceId || !name) {
      return res.status(400).json({ success: false, error: 'WorkspaceId and Name are required' });
    }

    const channel = await Channel.create({
      workspace: workspaceId,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      isPrivate: isPrivate || false,
      members: [req.user._id]
    });

    await AuditLog.create({
      workspace: workspaceId,
      user: req.user._id,
      action: 'CHANNEL_CREATED',
      entity: 'CHANNEL',
      details: `Channel "#${name}" created.`
    });

    res.status(201).json({ success: true, data: channel });
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { content, attachments } = req.body;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ success: false, error: 'Message content or attachment required' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

    const newMessage = {
      sender: req.user._id,
      content,
      attachments: attachments || [],
      createdAt: new Date()
    };

    channel.messages.push(newMessage);
    await channel.save();

    // Populate sender info for frontend rendering
    const populatedMessage = {
      ...newMessage,
      sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
    };

    // Broadcast message via Socket.io
    try {
      getIO().to(channelId).emit('new_message', { channelId, message: populatedMessage });
    } catch (e) {}

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    next(err);
  }
};

const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId)
      .populate('messages.sender', 'name email avatar');

    if (!channel) return res.status(404).json({ success: false, error: 'Channel not found' });

    res.json({ success: true, data: channel.messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWorkspaceChannels, createChannel, sendMessage, getChannelMessages };
