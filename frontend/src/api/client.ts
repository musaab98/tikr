const API_BASE = '/api';

export interface Audio {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  createdAt: string;
}

export interface Loop {
  id: string;
  audioId: string;
  start: number;
  end: number;
  label: string;
}

export const api = {
  async uploadAudio(file: File): Promise<Audio> {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await fetch(`${API_BASE}/audio`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async getAudioList(): Promise<Audio[]> {
    const res = await fetch(`${API_BASE}/audio`);
    if (!res.ok) throw new Error('Failed to fetch audio');
    return res.json();
  },

  getStreamUrl(id: string): string {
    return `${API_BASE}/audio/${id}/stream`;
  },

  async getLoops(audioId: string): Promise<Loop[]> {
    const res = await fetch(`${API_BASE}/audio/${audioId}/loops`);
    if (!res.ok) throw new Error('Failed to fetch loops');
    return res.json();
  },

  async createLoop(audioId: string, start: number, end: number, label?: string): Promise<Loop> {
    const res = await fetch(`${API_BASE}/audio/${audioId}/loops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start, end, label }),
    });
    if (!res.ok) throw new Error('Failed to create loop');
    return res.json();
  },

  async deleteLoop(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/loops/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete loop');
  },
};
