import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store';
import { Audio } from '../types';

const router = Router();
const AUDIO_DIR = path.join(__dirname, '../../data/audio');

const storage = multer.diskStorage({
  destination: AUDIO_DIR,
  filename: (_req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({ storage });

router.get('/', async (_req: Request, res: Response) => {
  try {
    const audio = await store.getAllAudio();
    res.json(audio);
  } catch {
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const audio: Audio = {
      id: path.parse(req.file.filename).name,
      filename: req.file.filename,
      originalName: req.file.originalname,
      duration: 0,
      createdAt: new Date().toISOString(),
    };

    await store.addAudio(audio);
    res.json(audio);
  } catch {
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const audio = await store.getAudio(id);
    if (!audio) {
      res.status(404).json({ error: 'Audio not found' });
      return;
    }
    res.json(audio);
  } catch {
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const deleted = await store.deleteAudio(id);
    if (!deleted) {
      res.status(404).json({ error: 'Audio not found' });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

router.get('/:id/stream', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const audio = await store.getAudio(id);
    if (!audio) {
      res.status(404).json({ error: 'Audio not found' });
      return;
    }

    const filePath = path.join(AUDIO_DIR, audio.filename);
    res.sendFile(filePath);
  } catch {
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

export default router;
