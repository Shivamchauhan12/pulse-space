const express = require('express');
const {
  getWorkspaceChannels,
  createChannel,
  sendMessage,
  getChannelMessages
} = require('../controllers/channel.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/workspace/:workspaceId', getWorkspaceChannels);
router.post('/', createChannel);
router.post('/:channelId/messages', sendMessage);
router.get('/:channelId/messages', getChannelMessages);

module.exports = router;
