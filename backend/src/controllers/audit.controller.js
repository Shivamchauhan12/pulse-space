const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ workspace: workspaceId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments({ workspace: workspaceId });

    res.json({
      success: true,
      data: {
        logs,
        page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };
