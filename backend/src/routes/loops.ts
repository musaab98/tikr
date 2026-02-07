import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store';
import type { Loop } from '../types';

const router = Router();

router.get('/audio/:audioId/loops', async (req: Request, res: Response) => {
  try {
    const audioId = req.params.audioId as string;
    const loops = await store.getLoopsByAudioId(audioId);
    res.json(loops);
  } catch {
    res.status(500).json({ error: 'Failed to fetch loops' });
  }
});

router.post('/audio/:audioId/loops', async (req: Request, res: Response) => {
  try {
    const audioId = req.params.audioId as string;
    const { start, end, label } = req.body;

    if (typeof start !== 'number' || typeof end !== 'number') {
      res.status(400).json({ error: 'Invalid start or end time' });
      return;
    }

    const loop: Loop = {
      id: uuidv4(),
      audioId,
      start,
      end,
      label: label || `Loop ${Date.now()}`,
    };

    await store.addLoop(loop);
    res.json(loop);
  } catch {
    res.status(500).json({ error: 'Failed to create loop' });
  }
});

router.delete('/loops/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await store.deleteLoop(id);
    if (!deleted) {
      res.status(404).json({ error: 'Loop not found' });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete loop' });
  }
});

export default router;
