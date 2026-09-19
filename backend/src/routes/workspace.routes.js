const express = require('express');
const {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  inviteMember,
  getWorkspaceAnalytics,
  deleteWorkspace
} = require('../controllers/workspace.controller');
const { protect } = require('../middlewares/auth.middleware');
const { permit } = require('../middlewares/rbac.middleware');

const router = express.Router();

router.use(protect);

router.post('/', createWorkspace);
router.get('/', getUserWorkspaces);
router.get('/:id', getWorkspaceById);
router.delete('/:id', permit('OWNER'), deleteWorkspace);
router.post('/:id/invite', permit('OWNER', 'ADMIN'), inviteMember);
router.get('/:id/analytics', permit('OWNER', 'ADMIN', 'MEMBER'), getWorkspaceAnalytics);

module.exports = router;
