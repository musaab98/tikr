# tikr — Development Plan

## Project Overview

**tikr** is a local-first, browser-based looping audio player for memorization practice. It allows users to load audio files, define loop segments, and seamlessly repeat them. The application runs entirely locally, uses Docker, and maintains minimal complexity.

---

## Architecture Summary

```
Browser (React + TypeScript + Vite)
            ↓
      HTTP/JSON API
            ↓
Express Backend (Node + TypeScript)
            ↓
   Filesystem (JSON + Audio)
```

**Key Characteristics:**
- Single user, single machine
- JSON-backed persistence
- No authentication
- Docker-runnable
- Local-only

---

## Technology Stack

### Frontend
- **React** (UI library)
- **TypeScript** (type safety)
- **Vite** (build tool)
- **HTML5 `<audio>`** (playback)

### Backend
- **Node.js** (runtime)
- **Express** (HTTP server)
- **TypeScript** (type safety)
- **multer** (file uploads)

### Persistence
- **JSON files** (audio.json, loops.json)
- **Node fs/promises** (file operations)

### Infrastructure
- **Docker** (containerization)
- **Docker Compose** (orchestration)

---

## Data Model

### Audio Metadata (`audio.json`)

```json
[
  {
    "id": "uuid",
    "filename": "uuid.mp3",
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
    "id": "uuid",
    "audioId": "uuid",
    "start": 10.2,
    "end": 18.6,
    "label": "phrase 1"
  }
]
```

---

## Backend API

### Audio Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/audio` | List all audio files |
| POST | `/api/audio` | Upload new audio file |
| GET | `/api/audio/:id` | Get audio metadata |
| GET | `/api/audio/:id/stream` | Stream audio file |

### Loop Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/audio/:id/loops` | Get loops for audio |
| POST | `/api/audio/:id/loops` | Create new loop |
| DELETE | `/api/loops/:id` | Delete loop |

---

## File Structure

```
tikr/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express server setup
│   │   ├── store.ts            # JSON persistence layer
│   │   ├── types.ts            # TypeScript types
│   │   └── routes/
│   │       ├── audio.ts        # Audio endpoints
│   │       └── loops.ts        # Loop endpoints
│   ├── data/
│   │   ├── audio.json          # Audio metadata
│   │   ├── loops.json          # Loop definitions
│   │   └── audio/              # Audio files
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main component
│   │   ├── components/
│   │   │   ├── AudioUploader.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── LoopList.tsx
│   │   │   └── LoopEditor.tsx
│   │   ├── hooks/
│   │   │   └── useAudioLoop.ts # Loop logic
│   │   ├── api/
│   │   │   └── client.ts       # API calls
│   │   └── types.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
├── .gitignore
├── PLAN.md
└── README.md
```

---

## Implementation Phases

### Phase 1: Backend Foundation (Days 1-2)

**Goals:**
- Express server running
- JSON store working
- Audio upload functional
- Audio streaming working

**Tasks:**
1. Initialize Node project
2. Set up TypeScript
3. Create Express server
4. Implement JSON store (read/write helpers)
5. Add audio upload endpoint
6. Add audio stream endpoint
7. Test with curl/Postman

**Deliverables:**
- Backend can accept uploads
- Backend can stream audio
- Data persists to JSON

---

### Phase 2: Frontend Shell (Days 3-4)

**Goals:**
- Vite app running
- Basic audio playback
- API integration

**Tasks:**
1. Initialize Vite + React + TypeScript
2. Create API client module
3. Build AudioUploader component
4. Build AudioPlayer component
5. Wire upload flow
6. Wire playback flow
7. Test end-to-end

**Deliverables:**
- User can upload audio
- User can play audio
- UI communicates with backend

---

### Phase 3: Loop Logic (Days 5-6)

**Goals:**
- Manual loop creation
- Automatic loop playback
- Loop persistence

**Tasks:**
1. Add loop API endpoints
2. Create LoopEditor component
3. Implement loop capture (start/end)
4. Build loop playback logic (timeupdate)
5. Create LoopList component
6. Add loop selection
7. Test loop transitions

**Deliverables:**
- User can define loops
- Loops play automatically
- Loops persist across sessions

---

### Phase 4: Keyboard Controls (Day 7)

**Goals:**
- Keyboard shortcuts working
- Improved UX

**Tasks:**
1. Add keyboard event handler
2. Implement space (play/pause)
3. Implement S/E (set start/end)
4. Implement L (toggle loop)
5. Implement 1-9 (select loop)
6. Add visual feedback
7. Handle edge cases

**Deliverables:**
- All keyboard shortcuts functional
- Visual state updates
- Clean user experience

---

### Phase 5: Docker & Polish (Day 8)

**Goals:**
- Docker build working
- One-command startup
- Basic error handling

**Tasks:**
1. Create Dockerfile
2. Create docker-compose.yml
3. Add volume mounts
4. Test build process
5. Add error handling
6. Improve UI feedback
7. Write documentation

**Deliverables:**
- `docker compose up` runs app
- Data persists via volumes
- README has clear instructions

---

## Audio Loop Algorithm

**Core Mechanism:**
- HTML5 `<audio>` element
- `timeupdate` event listener
- Manual `currentTime` manipulation

**Algorithm:**
```typescript
function onTimeUpdate(audio: HTMLAudioElement, loop: Loop) {
  const TOLERANCE = 0.05; // 50ms
  
  if (audio.currentTime >= loop.end - TOLERANCE) {
    audio.currentTime = loop.start;
  }
}
```

**Characteristics:**
- Not sample-accurate (~50ms precision)
- Simple and reliable
- No Web Audio API complexity

---

## Keyboard Shortcuts

| Key | Action | Behavior |
|-----|--------|----------|
| **Space** | Play/Pause | Toggle playback state |
| **S** | Set Start | Capture current time as loop start |
| **E** | Set End | Capture current time as loop end |
| **L** | Toggle Loop | Enable/disable looping |
| **1-9** | Select Loop | Switch to loop N |

---

## Docker Strategy

### Build Process
1. Build frontend (`npm run build`)
2. Copy frontend build to backend `public/`
3. Build backend TypeScript
4. Create single container
5. Expose port 3000

### Volume Mounts
```yaml
volumes:
  - ./backend/data:/app/data
```

### Startup Command
```bash
docker compose up --build
```

Access at: `http://localhost:3000`

---

## Known Limitations (v1)

### Accepted Tradeoffs
- **JSON persistence**: Not concurrent-safe
- **Loop accuracy**: ~50ms precision
- **Single user**: No multi-tenancy
- **Local only**: No cloud support
- **No auth**: Open access
- **File size**: No chunked upload

### Future Enhancements (Out of Scope)
- User accounts
- Cloud storage
- Sample-accurate looping
- Waveform visualization
- Mobile support
- Offline PWA

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Upload audio file
- [ ] Play/pause audio
- [ ] Set loop start
- [ ] Set loop end
- [ ] Loop plays automatically
- [ ] Switch between loops
- [ ] Refresh page (data persists)
- [ ] Upload second audio file
- [ ] Delete loop
- [ ] All keyboard shortcuts work

### Edge Cases
- Very short loops (<1 second)
- Loop start == loop end
- Multiple rapid loop changes
- Audio file upload failures
- Corrupted JSON files

---

## Success Criteria

✅ **Functional:**
- Loops play smoothly
- All API endpoints work
- Data persists correctly

✅ **Operational:**
- Runs with one command
- Survives container restarts
- Clear error messages

✅ **Code Quality:**
- TypeScript types used
- Components well-organized
- Logic separated from UI

✅ **Documentation:**
- README explains setup
- Code comments where needed
- Architecture decisions clear

---

## Next Steps

1. **Initialize Backend** → Set up Node + Express + TypeScript
2. **Initialize Frontend** → Set up Vite + React + TypeScript
3. **Implement Backend** → API + JSON store
4. **Implement Frontend** → Components + loop logic
5. **Dockerize** → Dockerfile + docker-compose
6. **Test** → Manual testing checklist
7. **Document** → Final README updates

---

## Resources

- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **HTML Audio API**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
- **Docker Compose**: https://docs.docker.com/compose/

---

**End of Plan**
