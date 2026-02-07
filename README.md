# tikr

A local-first audio looper for memorization practice.

Upload an audio file, mark loop segments, and repeat them seamlessly. Everything runs on your machine — no cloud, no accounts, no complexity.

## Quick Start

### Docker

```bash
docker compose up --build
```

Open **http://localhost:3000**

### Local Development

```bash
# backend
cd backend && npm install && npm run dev

# frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Frontend: **http://localhost:5173** · Backend: **http://localhost:3001**

## Usage

1. Upload an audio file
2. Press **S** to set a loop start, **E** for end
3. Press **U** to toggle looping
4. Save loops and switch between them with **1–9**

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Space / K | Play / Pause |
| ← / → | Seek ±5s |
| J / L | Seek ±10s |
| ↑ / ↓ | Volume ±5% |
| M | Mute toggle |
| S | Set loop start |
| E | Set loop end |
| U | Toggle looping |
| 1–9 | Select saved loop |

## Architecture

```
React + Vite (frontend)
       ↓ HTTP
Express + TypeScript (backend)
       ↓ fs
JSON files + audio on disk
```

Single-user, local-only. Audio metadata and loop definitions stored as JSON. Audio files stored on disk. No database.

## API

```
GET    /api/audio            List audio files
POST   /api/audio            Upload audio file
GET    /api/audio/:id        Get audio metadata
DELETE /api/audio/:id        Delete audio + loops
GET    /api/audio/:id/stream Stream audio

GET    /api/audio/:id/loops  Get loops for audio
POST   /api/audio/:id/loops  Create loop
DELETE /api/loops/:id        Delete loop
```

## Project Structure

```
tikr/
├── backend/
│   └── src/
│       ├── server.ts        Express entry point
│       ├── store.ts         JSON persistence
│       ├── types.ts         Shared interfaces
│       └── routes/
│           ├── audio.ts     Audio CRUD + streaming
│           └── loops.ts     Loop CRUD
├── frontend/
│   └── src/
│       ├── App.tsx          Main app + keyboard shortcuts
│       ├── App.css          Styles + theme
│       ├── api/client.ts    API client
│       ├── hooks/
│       │   └── useAudioLoop.ts  Audio playback + looping hook
│       ├── components/
│       │   ├── AudioPlayer.tsx
│       │   ├── AudioUploader.tsx
│       │   ├── LoopEditor.tsx
│       │   └── LoopList.tsx
│       └── utils/
│           └── format.ts    Shared formatting helpers├── Dockerfile
├── docker-compose.yml└── README.md
```

## Design Tradeoffs

- **JSON files over a database** — single-user app, easy to inspect and debug
- **HTML5 Audio over Web Audio API** — simpler, ~50ms loop precision is acceptable
- **Local-only** — no auth, no sync, no infra to maintain

## License

MIT