import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient();
const pubClient: RedisClientType = redisClient.duplicate();
const subClient: RedisClientType = redisClient.duplicate();

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    await pubClient.connect();
    await subClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection failed:', error);
    process.exit(1);
  }
};

export { redisClient, pubClient, subClient };
