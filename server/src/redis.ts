import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL
const REDIS_PASSWORD = process.env.REDIS_PASSWORD
const REDIS_PORT = process.env.REDIS_PORT

const redisClient: RedisClientType = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_URL,
    port: Number(REDIS_PORT)
  }
});

const pubClient: RedisClientType = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_URL,
    port: Number(REDIS_PORT)
  }
});

const subClient: RedisClientType = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_URL,
    port: Number(REDIS_PORT)
  }
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    await pubClient.connect();
    await subClient.connect();
    console.log('Redis Cloud connected successfully');
  } catch (error) {
    console.error('Redis connection to Cloud failed:', error);
    process.exit(1);
  }
};

export { pubClient, redisClient, subClient };

