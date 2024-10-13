import { Router, Request, Response } from 'express';
import prismaClient from './prisma';

const router = Router();

router.get('/api/boards/:boardId/messages', async (req: Request, res: Response) => {
  const { boardId } = req.params;
  try {
    const messages = await prismaClient.message.findMany({
      where: { boardId },
      orderBy: { timestamp: 'asc' },
    });
    
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
