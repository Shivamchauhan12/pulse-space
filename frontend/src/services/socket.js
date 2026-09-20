import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

export const getSocket = () => socket;
