import { promises as fs } from 'fs';
import path from 'path';
import { Audio, Loop } from './types';

const DATA_DIR = path.join(__dirname, '../data');
const AUDIO_DIR = path.join(DATA_DIR, 'audio');
const AUDIO_FILE = path.join(DATA_DIR, 'audio.json');
const LOOPS_FILE = path.join(DATA_DIR, 'loops.json');

async function readJSON<T>(filePath: string): Promise<T[]> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeJSON<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export const store = {
  async getAllAudio(): Promise<Audio[]> {
    return readJSON<Audio>(AUDIO_FILE);
  },

  async addAudio(audio: Audio): Promise<void> {
    const all = await this.getAllAudio();
    all.push(audio);
    await writeJSON(AUDIO_FILE, all);
  },

  async getAudio(id: string): Promise<Audio | undefined> {
    const all = await this.getAllAudio();
    return all.find((a) => a.id === id);
  },

  async getAllLoops(): Promise<Loop[]> {
    return readJSON<Loop>(LOOPS_FILE);
  },

  async getLoopsByAudioId(audioId: string): Promise<Loop[]> {
    const all = await this.getAllLoops();
    return all.filter((l) => l.audioId === audioId);
  },

  async addLoop(loop: Loop): Promise<void> {
    const all = await this.getAllLoops();
    all.push(loop);
    await writeJSON(LOOPS_FILE, all);
  },

  async deleteLoop(id: string): Promise<boolean> {
    const all = await this.getAllLoops();
    const filtered = all.filter((l) => l.id !== id);
    if (filtered.length === all.length) return false;
    await writeJSON(LOOPS_FILE, filtered);
    return true;
  },

  async deleteLoopsByAudioId(audioId: string): Promise<void> {
    const all = await this.getAllLoops();
    const filtered = all.filter((l) => l.audioId !== audioId);
    await writeJSON(LOOPS_FILE, filtered);
  },

  async deleteAudio(id: string): Promise<boolean> {
    const audio = await this.getAudio(id);
    if (!audio) return false;

    // Remove the audio file from disk
    try {
      await fs.unlink(path.join(AUDIO_DIR, audio.filename));
    } catch {
      // File may already be gone
    }

    // Remove all loops for this audio
    await this.deleteLoopsByAudioId(id);

    // Remove audio metadata
    const all = await this.getAllAudio();
    const filtered = all.filter((a) => a.id !== id);
    await writeJSON(AUDIO_FILE, filtered);
    return true;
  },
};
