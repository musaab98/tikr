# tikr

> A local-first looping audio player for memorization practice

**tikr** is a simple, browser-based audio looper that runs entirely on your machine. Load an audio file, define loop segments, and practice memorizing content through seamless repetition.

Built to demonstrate minimal full-stack architecture with clear tradeoffs:
- **Local-first**: No cloud, no auth, no complexity
- **JSON-backed**: Simple persistence, easy to inspect
- **Docker-runnable**: One command to start
- **Keyboard-driven**: Efficient workflow for power users

---

## Features

- 🎵 **Audio Upload & Playback** — Load MP3 files and play them
- ➰ **Loop Definition** — Set start/end points for any segment
- 🔁 **Automatic Looping** — Seamlessly repeat defined segments
- ⌨️ **Keyboard Shortcuts** — Control playback without touching the mouse
- 💾 **Local Persistence** — Audio and loops saved to JSON files
- 🐳 **Docker-Ready** — Single-command setup

---

## Quick Start

### Prerequisites

- **Docker** (with Docker Compose)
- A modern web browser

### Run

```bash
git clone https://github.com/yourusername/tikr.git
cd tikr
docker compose up --build
```

Open **http://localhost:3000**

---

## Usage

### 1. Upload Audio

Click "Upload Audio" and select an MP3 file from your machine.

### 2. Define a Loop

1. Play the audio
2. Press **S** at the desired start point
3. Press **E** at the desired end point
4. Press **L** to enable looping

### 3. Switch Loops

- Create multiple loops per audio file
- Press **1-9** to switch between loops
- Use the loop list to select and manage loops

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Play / Pause |
| **S** | Set loop start |
| **E** | Set loop end |
| **L** | Toggle looping on/off |
| **1-9** | Select loop by number |

---

## Architecture

```
┌─────────────────────┐
│  React Frontend     │
│  (Vite + TypeScript)│
└──────────┬──────────┘
           │ HTTP/JSON
┌──────────▼──────────┐
│  Express Backend    │
│  (Node + TypeScript)│
└──────────┬──────────┘
           │ fs
┌──────────▼──────────┐
│  JSON Files         │
│  audio.json         │
│  loops.json         │
│  audio/*.mp3        │
└─────────────────────┘
```

### Tech Stack

**Frontend:**
- React + TypeScript
- Vite (build tool)
- HTML5 `<audio>` (playback)

**Backend:**
- Node.js + Express
- TypeScript
- JSON file storage

**Infrastructure:**
- Docker + Docker Compose

---

## Project Structure

```
tikr/
├── backend/
│   ├── src/
│   │   ├── server.ts       # Express app
│   │   ├── store.ts        # JSON persistence
│   │   └── routes/         # API endpoints
│   └── data/
│       ├── audio.json      # Audio metadata
│       ├── loops.json      # Loop definitions
│       └── audio/          # Uploaded files
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── api/            # API client
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## API Reference

### Audio Endpoints

```
GET    /api/audio              # List all audio files
POST   /api/audio              # Upload audio file
GET    /api/audio/:id          # Get audio metadata
GET    /api/audio/:id/stream   # Stream audio file
```

### Loop Endpoints

```
GET    /api/audio/:id/loops    # Get loops for audio file
POST   /api/audio/:id/loops    # Create new loop
DELETE /api/loops/:id          # Delete loop
```

---

## Data Format

### Audio Metadata (`audio.json`)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "550e8400-e29b-41d4-a716-446655440000.mp3",
    "originalName": "lecture.mp3",
    "duration": 142.3,
    "createdAt": "2026-01-24T10:00:00.000Z"
  }
]
```

### Loop Segments (`loops.json`)

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "audioId": "550e8400-e29b-41d4-a716-446655440000",
    "start": 10.2,
    "end": 18.6,
    "label": "phrase 1"
  }
]
```

---

## Development

### Local Setup (Without Docker)

#### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on **http://localhost:3001**

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

### Building

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

---

## Design Decisions

### Why JSON Files?

- **Simplicity**: No database setup required
- **Transparency**: Easy to inspect and debug
- **Sufficient**: Single-user app doesn't need more

**Tradeoff**: Not concurrent-safe, won't scale to multiple users

### Why HTML5 Audio?

- **Built-in**: No external dependencies
- **Simple**: Straightforward API
- **Sufficient**: Good enough for ~50ms loop precision

**Tradeoff**: Not sample-accurate (Web Audio API would be more complex)

### Why Local-Only?

- **Privacy**: Audio never leaves your machine
- **Speed**: No network latency
- **Control**: You own your data

**Tradeoff**: No mobile access, no sharing

---

## Limitations (v1)

- ⚠️ **Loop precision**: ~50ms accuracy (not sample-perfect)
- ⚠️ **Single user**: No authentication or multi-user support
- ⚠️ **Local only**: No cloud sync
- ⚠️ **File size**: Large uploads may be slow
- ⚠️ **Concurrency**: JSON store not thread-safe

All intentional tradeoffs for v1 simplicity.

---

## Roadmap

**Current Version: v1.0**

Potential future enhancements:
- Waveform visualization
- Sample-accurate looping (Web Audio API)
- Mobile-friendly UI
- Cloud storage option
- Multi-user support
- Playlist management

---

## Contributing

This is a proof-of-concept project focused on demonstrating minimal architecture.

If you'd like to contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

MIT License - See [LICENSE](LICENSE) file

---

## Acknowledgments

Built to explore:
- Local-first architecture
- Minimal full-stack patterns
- Practical engineering tradeoffs
- Clear, maintainable code

---

**Questions?** Open an issue or read [PLAN.md](PLAN.md) for detailed technical planning.