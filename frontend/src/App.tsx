import { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import type { Audio, Loop } from './api/client';
import { useAudioLoop } from './hooks/useAudioLoop';
import { AudioUploader } from './components/AudioUploader';
import { AudioPlayer } from './components/AudioPlayer';
import { LoopEditor } from './components/LoopEditor';
import { LoopList } from './components/LoopList';
import './App.css';

function App() {
  const [audioList, setAudioList] = useState<Audio[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [activeLoop, setActiveLoop] = useState<Loop | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);

  const audioUrl = selectedAudio ? api.getStreamUrl(selectedAudio.id) : null;

  const { isPlaying, currentTime, duration, togglePlay, seek } = useAudioLoop({
    audioUrl,
    activeLoop: isLooping ? activeLoop : null,
    isLooping,
  });

  // Load audio list on mount
  useEffect(() => {
    api.getAudioList().then(setAudioList).catch(console.error);
  }, []);

  // Load loops when audio changes
  useEffect(() => {
    if (selectedAudio) {
      api.getLoops(selectedAudio.id).then(setLoops).catch(console.error);
    } else {
      setLoops([]);
    }
    setActiveLoop(null);
    setLoopStart(null);
    setLoopEnd(null);
  }, [selectedAudio]);

  const handleUpload = async (file: File) => {
    try {
      const audio = await api.uploadAudio(file);
      setAudioList((prev) => [...prev, audio]);
      setSelectedAudio(audio);
    } catch (err) {
      alert('Failed to upload audio');
      console.error(err);
    }
  };

  const handleSetStart = useCallback(() => {
    setLoopStart(currentTime);
  }, [currentTime]);

  const handleSetEnd = useCallback(() => {
    setLoopEnd(currentTime);
  }, [currentTime]);

  const handleToggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const handleSaveLoop = async (label: string) => {
    if (!selectedAudio || loopStart === null || loopEnd === null) return;

    try {
      const loop = await api.createLoop(selectedAudio.id, loopStart, loopEnd, label);
      setLoops((prev) => [...prev, loop]);
      setActiveLoop(loop);
      setIsLooping(true);
      setLoopStart(null);
      setLoopEnd(null);
    } catch (err) {
      alert('Failed to save loop');
      console.error(err);
    }
  };

  const handleSelectLoop = (loop: Loop) => {
    setActiveLoop(loop);
    setIsLooping(true);
    seek(loop.start);
  };

  const handleDeleteLoop = async (id: string) => {
    try {
      await api.deleteLoop(id);
      setLoops((prev) => prev.filter((l) => l.id !== id));
      if (activeLoop?.id === id) {
        setActiveLoop(null);
        setIsLooping(false);
      }
    } catch (err) {
      alert('Failed to delete loop');
      console.error(err);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 's':
          handleSetStart();
          break;
        case 'e':
          handleSetEnd();
          break;
        case 'l':
          handleToggleLoop();
          break;
        default:
          if (e.key >= '1' && e.key <= '9') {
            const idx = parseInt(e.key) - 1;
            if (loops[idx]) {
              handleSelectLoop(loops[idx]);
            }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSetStart, handleSetEnd, handleToggleLoop, loops]);

  return (
    <div className="app">
      <header>
        <h1>🎵 tikr</h1>
        <p>Local-first audio looper for memorization</p>
      </header>

      <main>
        <AudioUploader onUpload={handleUpload} />

        {audioList.length > 0 && (
          <div className="audio-list">
            <h3>Audio Files</h3>
            <div className="audio-buttons">
              {audioList.map((audio) => (
                <button
                  key={audio.id}
                  onClick={() => setSelectedAudio(audio)}
                  className={selectedAudio?.id === audio.id ? 'selected' : ''}
                >
                  {audio.originalName}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedAudio && (
          <>
            <h2>{selectedAudio.originalName}</h2>

            <AudioPlayer
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onTogglePlay={togglePlay}
              onSeek={seek}
            />

            <LoopEditor
              currentTime={currentTime}
              loopStart={loopStart}
              loopEnd={loopEnd}
              isLooping={isLooping}
              onSetStart={handleSetStart}
              onSetEnd={handleSetEnd}
              onToggleLoop={handleToggleLoop}
              onSaveLoop={handleSaveLoop}
            />

            <LoopList
              loops={loops}
              activeLoop={activeLoop}
              onSelectLoop={handleSelectLoop}
              onDeleteLoop={handleDeleteLoop}
            />

            <div className="shortcuts-help">
              <h4>⌨️ Keyboard Shortcuts</h4>
              <ul>
                <li><kbd>Space</kbd> Play/Pause</li>
                <li><kbd>S</kbd> Set loop start</li>
                <li><kbd>E</kbd> Set loop end</li>
                <li><kbd>L</kbd> Toggle looping</li>
                <li><kbd>1-9</kbd> Select loop</li>
              </ul>
            </div>
          </>
        )}

        {!selectedAudio && audioList.length === 0 && (
          <div className="empty-state">
            <p>👆 Upload an audio file to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
