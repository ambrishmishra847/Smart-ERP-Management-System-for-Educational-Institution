import { Server } from 'socket.io';

let io = null;

/**
 * Create Socket.io server attached to existing HTTP server.
 * CORS allows CLIENT_URL for frontend.
 */
export const createSocketServer = (httpServer) => {
  if (io) return io;
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join', (payload) => {
      const userId = typeof payload === 'string' ? payload : payload?.userId;
      const role = typeof payload === 'object' ? payload?.role : undefined;

      if (userId) socket.join(`user_${userId}`);
      if (role) socket.join(`role_${role}`);
    });
    socket.on('disconnect', () => {});
  });

  return io;
};

/**
 * Emit event to all connected clients (or to specific user room if you use join).
 */
export const notifyClients = (event, data) => {
  if (io) io.emit(event, data);
};

/**
 * Notify a specific user by userId (they must have joined with that id).
 */
export const notifyUser = (userId, event, data) => {
  if (io) io.to(`user_${userId}`).emit(event, data);
};

/**
 * Notify all users of a role (they must have joined with that role).
 */
export const notifyRole = (role, event, data) => {
  if (io) io.to(`role_${role}`).emit(event, data);
};
