import express from 'express';
import cors from 'cors';
import path from 'path';
import audioRoutes from './routes/audio';
import loopRoutes from './routes/loops';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/audio', audioRoutes);
app.use('/api', loopRoutes);

// Serve static frontend (in production)
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

app.listen(PORT, () => {
  console.log(`🎵 tikr server running on http://localhost:${PORT}`);
});
