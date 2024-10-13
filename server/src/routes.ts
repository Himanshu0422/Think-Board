import { Router, Request, Response } from 'express';
import { redisClient } from './redis';

const router = Router();

router.get('/api/boards/:boardId/messages', async (req: Request, res: Response) => {
  const { boardId } = req.params;
  try {
    const messages = await redisClient.lRange(`board:${boardId}:messages`, 0, -1);
    const parsedMessages = messages.map((msg) => JSON.parse(msg));
    res.json(parsedMessages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
