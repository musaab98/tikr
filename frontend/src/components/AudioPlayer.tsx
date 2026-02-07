import { formatTime } from '../utils/format';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

export function AudioPlayer({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlay,
  onSeek,
  onVolumeChange,
}: AudioPlayerProps) {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  return (
    <div className="audio-player">
      <div className="progress-container">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="progress-slider"
        />
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="audio-controls">
        <div className="spacer" />
        <button onClick={onTogglePlay} className={`play-btn ${isPlaying ? 'playing' : ''}`}>
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <div className="volume-control">
          <span className="volume-label">{isMuted || volume === 0 ? '🔇' : '🔊'}</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
}
