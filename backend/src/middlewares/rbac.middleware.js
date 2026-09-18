const Workspace = require('../models/Workspace');

const permit = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId || req.params.id;
      if (!workspaceId) {
        return res.status(400).json({ success: false, error: 'Workspace ID required for permission verification' });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ success: false, error: 'Workspace not found' });
      }

      const member = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        return res.status(403).json({ success: false, error: 'Access denied: You are not a member of this workspace' });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] roles, your role is ${member.role}`
        });
      }

      req.workspace = workspace;
      req.workspaceRole = member.role;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  };
};

module.exports = { permit };
