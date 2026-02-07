import type { Loop } from '../api/client';
import { formatTime } from '../utils/format';

interface LoopListProps {
  loops: Loop[];
  activeLoop: Loop | null;
  onSelectLoop: (loop: Loop) => void;
  onDeleteLoop: (id: string) => void;
}

export function LoopList({ loops, activeLoop, onSelectLoop, onDeleteLoop }: LoopListProps) {
  if (loops.length === 0) {
    return (
      <div className="loop-list empty">
        <p>No loops yet. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="loop-list">
      <h3>Saved Loops ({loops.length})</h3>
      <ul>
        {loops.map((loop, index) => (
          <li
            key={loop.id}
            className={`loop-item ${activeLoop?.id === loop.id ? 'active' : ''}`}
            onClick={() => onSelectLoop(loop)}
          >
            <div className="loop-info">
              <strong>
                {index + 1}. {loop.label}
              </strong>
              <span>
                {formatTime(loop.start)} → {formatTime(loop.end)} ({(loop.end - loop.start).toFixed(1)}s)
              </span>
            </div>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteLoop(loop.id);
              }}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
