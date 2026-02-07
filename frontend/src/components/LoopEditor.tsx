import { formatTime } from '../utils/format';

interface LoopEditorProps {
  currentTime: number;
  loopStart: number | null;
  loopEnd: number | null;
  isLooping: boolean;
  audioName: string;
  onSetStart: () => void;
  onSetEnd: () => void;
  onToggleLoop: () => void;
  onSaveLoop: (label: string) => void;
  onDeleteAudio: () => void;
}

export function LoopEditor({
  currentTime,
  loopStart,
  loopEnd,
  isLooping,
  audioName,
  onSetStart,
  onSetEnd,
  onToggleLoop,
  onSaveLoop,
  onDeleteAudio,
}: LoopEditorProps) {
  const canSave = loopStart !== null && loopEnd !== null && loopEnd > loopStart;

  const handleSave = () => {
    const label = prompt('Enter loop label:', `Loop ${formatTime(loopStart)}-${formatTime(loopEnd)}`);
    if (label) {
      onSaveLoop(label);
    }
  };

  return (
    <div className="loop-editor">
      <h3>Loop Editor</h3>
      <p className="current-time">Current: {formatTime(currentTime)}</p>

      <div className="loop-controls">
        <div className="loop-point">
          <button onClick={onSetStart} className="set-btn start">
            Set Start (S)
          </button>
          <span>Start: {formatTime(loopStart)}</span>
        </div>

        <div className="loop-point">
          <button onClick={onSetEnd} className="set-btn end">
            Set End (E)
          </button>
          <span>End: {formatTime(loopEnd)}</span>
        </div>
      </div>

      <div className="loop-actions">
        <button onClick={onToggleLoop} className={`toggle-btn ${isLooping ? 'active' : ''}`}>
          {isLooping ? '🔁 Looping ON (U)' : '⭕ Looping OFF (U)'}
        </button>
        <button onClick={handleSave} disabled={!canSave} className="save-btn">
          💾 Save Loop
        </button>
        <button
          onClick={() => {
            if (window.confirm(`Delete "${audioName}" and all its loops? This cannot be undone.`)) {
              onDeleteAudio();
            }
          }}
          className="delete-audio-btn"
        >
          🗑️ Delete Audio
        </button>
      </div>
    </div>
  );
}
