const express = require('express');
const authRoutes = require('./auth.routes');
const workspaceRoutes = require('./workspace.routes');
const boardRoutes = require('./board.routes');
const documentRoutes = require('./document.routes');
const channelRoutes = require('./channel.routes');
const auditRoutes = require('./audit.routes');
const searchRoutes = require('./search.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/boards', boardRoutes);
router.use('/documents', documentRoutes);
router.use('/channels', channelRoutes);
router.use('/audit', auditRoutes);
router.use('/search', searchRoutes);

module.exports = router;
