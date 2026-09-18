const { Server } = require('socket.io');
const logger = require('../config/logger');

let io = null;

const initSocket = (httpServer, corsOrigin) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket Connected: ${socket.id}`);

    // Join workspace or channel room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      logger.info(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      logger.info(`Socket ${socket.id} left room ${roomId}`);
    });

    // Typing indicators
    socket.on('typing_start', ({ roomId, userName }) => {
      socket.to(roomId).emit('user_typing', { userName, isTyping: true });
    });

    socket.on('typing_stop', ({ roomId, userName }) => {
      socket.to(roomId).emit('user_typing', { userName, isTyping: false });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
