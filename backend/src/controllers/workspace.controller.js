const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Board = require('../models/Board');
const Document = require('../models/Document');
const Channel = require('../models/Channel');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Workspace name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    
    const workspace = await Workspace.create({
      name,
      slug,
      description: description || '',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'OWNER' }]
    });

    // Default Channel creation
    await Channel.create({
      workspace: workspace._id,
      name: 'general',
      description: 'Company-wide announcements and discussion',
      members: [req.user._id]
    });

    await AuditLog.create({
      workspace: workspace._id,
      user: req.user._id,
      action: 'WORKSPACE_CREATED',
      entity: 'WORKSPACE',
      details: `Workspace "${name}" created.`
    });

    res.status(201).json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
};

const getUserWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ 'members.user': req.user._id })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar isOnline');
    
    res.json({ success: true, data: workspaces });
  } catch (err) {
    next(err);
  }
};

const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar isOnline');

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    res.json({ success: true, data: workspace });
  } catch (err) {
    next(err);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User with this email not found' });
    }

    const existingMember = workspace.members.find((m) => m.user.toString() === targetUser._id.toString());
    if (existingMember) {
      return res.status(400).json({ success: false, error: 'User is already a member of this workspace' });
    }

    workspace.members.push({ user: targetUser._id, role: role || 'MEMBER' });
    await workspace.save();

    await AuditLog.create({
      workspace: workspace._id,
      user: req.user._id,
      action: 'MEMBER_INVITED',
      entity: 'MEMBER',
      details: `Invited ${email} as ${role || 'MEMBER'}`
    });

    res.json({ success: true, message: 'Member added successfully', data: workspace });
  } catch (err) {
    next(err);
  }
};

// MongoDB Aggregation Pipeline for Workspace Analytics
const getWorkspaceAnalytics = async (req, res, next) => {
  try {
    const workspaceId = new mongoose.Types.ObjectId(req.params.id);

    // MongoDB Aggregation Pipeline computing metrics across Boards, Cards, Docs, & Channels
    const analytics = await Board.aggregate([
      { $match: { workspace: workspaceId } },
      { $unwind: { path: '$lists', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$lists.cards', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$lists.cards.priority',
          count: { $sum: 1 },
          totalStoryPoints: { $sum: '$lists.cards.storyPoints' }
        }
      }
    ]);

    const totalDocs = await Document.countDocuments({ workspace: workspaceId });
    const totalChannels = await Channel.countDocuments({ workspace: workspaceId });
    
    const workspace = await Workspace.findById(workspaceId);

    res.json({
      success: true,
      data: {
        totalMembers: workspace ? workspace.members.length : 0,
        totalDocs,
        totalChannels,
        cardBreakdown: analytics
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete Workspace (Cascading cleanup)
const deleteWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.id;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // Verify requesting user is the OWNER of the workspace
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only the Workspace Owner can delete this workspace' });
    }

    // Cascading deletion of associated resources
    await Board.deleteMany({ workspace: workspaceId });
    await Document.deleteMany({ workspace: workspaceId });
    await Channel.deleteMany({ workspace: workspaceId });
    await AuditLog.deleteMany({ workspace: workspaceId });
    await Workspace.findByIdAndDelete(workspaceId);

    res.json({ success: true, message: 'Workspace and all associated resources deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createWorkspace, getUserWorkspaces, getWorkspaceById, inviteMember, getWorkspaceAnalytics, deleteWorkspace };
