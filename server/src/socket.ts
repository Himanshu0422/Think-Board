import { Server, Socket } from 'socket.io';
import { produceMessage } from './kafka';
import { pubClient, redisClient, subClient } from './redis';

export const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('joinBoard', ({ boardId, username }: { boardId: string; username: string }) => {
      socket.join(boardId);
      console.log(`${username} joined board: ${boardId}`);
      socket.to(boardId).emit('userJoined', `${username} has joined the chat.`);
    });

    socket.on('sendMessage', async ({ boardId, username, message }: { boardId: string; username: string; message: string }) => {
      const chatMessage = { username, message, timestamp: new Date() };
      try {
        // Producing message using kafka
        produceMessage(message, boardId, username)

        // Also store in Redis for quick retrieval and publish to the chat channel
        await redisClient.rPush(`board:${boardId}:messages`, JSON.stringify(chatMessage));
        pubClient.publish('chatChannel', JSON.stringify({ boardId, chatMessage }));
      } catch (error) {
        console.error('Failed to store message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  subClient.subscribe('chatChannel', (message: string) => {
    const { boardId, chatMessage } = JSON.parse(message);
    io.to(boardId).emit('receiveMessage', chatMessage);
  });
};
