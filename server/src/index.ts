import http from 'http';
import { Server } from 'socket.io';
import { connectRedis } from './redis';
import { socketHandler } from './socket';
import app from './server';
import { startMessageConsumer } from './kafka';

const dotenv = require('dotenv');
require('dotenv').config();

const PORT = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize Redis and Socket.IO
connectRedis();
socketHandler(io);
startMessageConsumer();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
