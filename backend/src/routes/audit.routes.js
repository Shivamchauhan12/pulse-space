const express = require('express');
const { getAuditLogs } = require('../controllers/audit.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/workspace/:workspaceId', getAuditLogs);

module.exports = router;
