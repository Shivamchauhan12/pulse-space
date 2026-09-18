const Board = require('../models/Board');
const AuditLog = require('../models/AuditLog');
const redisService = require('../services/redis.service');
const { getIO } = require('../services/socket.service');
const mongoose = require('mongoose');

const getWorkspaceBoards = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const cacheKey = `boards_ws_${workspaceId}`;
    
    // Attempt Redis cache hit
    const cachedBoards = await redisService.get(cacheKey);
    if (cachedBoards) {
      return res.json({ success: true, source: 'cache', data: cachedBoards });
    }

    const boards = await Board.find({ workspace: workspaceId });
    await redisService.set(cacheKey, boards, 300); // 5 min TTL

    res.json({ success: true, source: 'database', data: boards });
  } catch (err) {
    next(err);
  }
};

const createBoard = async (req, res, next) => {
  try {
    const { workspaceId, title, description } = req.body;
    if (!workspaceId || !title) {
      return res.status(400).json({ success: false, error: 'WorkspaceId and Title are required' });
    }

    const defaultLists = [
      { title: 'To Do', position: 0, cards: [] },
      { title: 'In Progress', position: 1, cards: [] },
      { title: 'In Review', position: 2, cards: [] },
      { title: 'Done', position: 3, cards: [] }
    ];

    const board = await Board.create({
      workspace: workspaceId,
      title,
      description: description || '',
      lists: defaultLists
    });

    // Invalidate Redis cache
    await redisService.del(`boards_ws_${workspaceId}`);

    await AuditLog.create({
      workspace: workspaceId,
      user: req.user._id,
      action: 'BOARD_CREATED',
      entity: 'BOARD',
      details: `Board "${title}" created.`
    });

    res.status(201).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

const getBoardById = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('lists.cards.assignees', 'name email avatar');

    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    res.json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

const addCard = async (req, res, next) => {
  try {
    const { boardId, listId } = req.params;
    const { title, description, priority, storyPoints, dueDate, assignees } = req.body;

    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ success: false, error: 'Board not found' });

    const list = board.lists.id(listId);
    if (!list) return res.status(404).json({ success: false, error: 'List not found' });

    const newCard = {
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      storyPoints: storyPoints || 1,
      dueDate: dueDate || null,
      assignees: assignees || [],
      position: list.cards.length
    };

    list.cards.push(newCard);
    await board.save();

    await redisService.del(`boards_ws_${board.workspace}`);

    // Broadcast via Socket.io for real-time Kanban sync
    try {
      getIO().to(boardId).emit('card_added', { boardId, listId, card: newCard });
    } catch (e) {}

    res.status(201).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// MongoDB Transaction for Atomic Card Movement across lists
const moveCard = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { boardId } = req.params;
    const { sourceListId, targetListId, cardId, newPosition } = req.body;

    const board = await Board.findById(boardId).session(session);
    if (!board) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    const sourceList = board.lists.id(sourceListId);
    const targetList = board.lists.id(targetListId);
    if (!sourceList || !targetList) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'List not found' });
    }

    const cardIndex = sourceList.cards.findIndex((c) => c._id.toString() === cardId);
    if (cardIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, error: 'Card not found in source list' });
    }

    const [movedCard] = sourceList.cards.splice(cardIndex, 1);
    movedCard.position = newPosition;
    targetList.cards.splice(newPosition, 0, movedCard);

    await board.save({ session });
    await session.commitTransaction();
    session.endSession();

    await redisService.del(`boards_ws_${board.workspace}`);

    // Real-time broadcast
    try {
      getIO().to(boardId).emit('card_moved', { boardId, sourceListId, targetListId, cardId, newPosition });
    } catch (e) {}

    res.json({ success: true, message: 'Card moved atomically', data: board });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

module.exports = { getWorkspaceBoards, createBoard, getBoardById, addCard, moveCard };
