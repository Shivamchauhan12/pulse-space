const Board = require('../models/Board');
const Document = require('../models/Document');
const Channel = require('../models/Channel');
const mongoose = require('mongoose');

const globalSearch = async (req, res, next) => {
  try {
    const { workspaceId, query } = req.query;
    if (!workspaceId || !query) {
      return res.status(400).json({ success: false, error: 'workspaceId and query parameters are required' });
    }

    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const regex = new RegExp(query, 'i');

    // Mongo Aggregation search on Docs
    const docs = await Document.find({ workspace: wsId, title: regex, isArchived: false })
      .select('title icon updatedAt')
      .limit(5);

    // Mongo Aggregation search on Cards inside Boards
    const cardsMatch = await Board.aggregate([
      { $match: { workspace: wsId } },
      { $unwind: '$lists' },
      { $unwind: '$lists.cards' },
      { $match: { 'lists.cards.title': regex } },
      {
        $project: {
          _id: '$lists.cards._id',
          title: '$lists.cards.title',
          priority: '$lists.cards.priority',
          boardTitle: '$title',
          listTitle: '$lists.title'
        }
      },
      { $limit: 5 }
    ]);

    // Mongo Aggregation search on Chat Messages inside Channels
    const chatMatch = await Channel.aggregate([
      { $match: { workspace: wsId } },
      { $unwind: '$messages' },
      { $match: { 'messages.content': regex } },
      {
        $project: {
          _id: '$messages._id',
          content: '$messages.content',
          channelName: '$name',
          createdAt: '$messages.createdAt'
        }
      },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        documents: docs,
        cards: cardsMatch,
        messages: chatMatch
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { globalSearch };
