const express = require('express');
const {
  getWorkspaceBoards,
  createBoard,
  getBoardById,
  addCard,
  moveCard
} = require('../controllers/board.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/workspace/:workspaceId', getWorkspaceBoards);
router.post('/', createBoard);
router.get('/:id', getBoardById);
router.post('/:boardId/lists/:listId/cards', addCard);
router.put('/:boardId/cards/move', moveCard);

module.exports = router;
