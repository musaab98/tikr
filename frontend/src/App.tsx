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

  const {
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    volume,
    setVolume,
    adjustVolume,
    toggleMute,
    isMuted,
  } = useAudioLoop({
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

  const handleDeleteAudio = async () => {
    if (!selectedAudio) return;
    try {
      await api.deleteAudio(selectedAudio.id);
      setAudioList((prev) => prev.filter((a) => a.id !== selectedAudio.id));
      setSelectedAudio(null);
      setLoops([]);
      setActiveLoop(null);
      setIsLooping(false);
    } catch (err) {
      alert('Failed to delete audio');
      console.error(err);
    }
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

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration, currentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.05);
          break;
        case 'j':
          seek(Math.max(0, currentTime - 10));
          break;
        case 'l':
          seek(Math.min(duration, currentTime + 10));
          break;
        case 'm':
          toggleMute();
          break;
        case 's':
          handleSetStart();
          break;
        case 'e':
          handleSetEnd();
          break;
        case 'u':
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
  }, [
    togglePlay,
    handleSetStart,
    handleSetEnd,
    handleToggleLoop,
    loops,
    seek,
    currentTime,
    duration,
    adjustVolume,
    toggleMute,
  ]);

  return (
    <div className="app">
      <header>
        <h1>tikr</h1>
        <p>Smart audio player with looping features.</p>
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
              volume={volume}
              isMuted={isMuted}
              onTogglePlay={togglePlay}
              onSeek={seek}
              onVolumeChange={setVolume}
            />

            <LoopEditor
              currentTime={currentTime}
              loopStart={loopStart}
              loopEnd={loopEnd}
              isLooping={isLooping}
              audioName={selectedAudio.originalName}
              onSetStart={handleSetStart}
              onSetEnd={handleSetEnd}
              onToggleLoop={handleToggleLoop}
              onSaveLoop={handleSaveLoop}
              onDeleteAudio={handleDeleteAudio}
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
                <li><kbd>Space</kbd> / <kbd>K</kbd> Play/Pause</li>
                <li><kbd>←</kbd> / <kbd>→</kbd> Advance ±5s</li>
                <li><kbd>J</kbd> / <kbd>L</kbd> Advance ±10s</li>
                <li><kbd>↑</kbd> / <kbd>↓</kbd> Volume ±5%</li>
                <li><kbd>M</kbd> Mute</li>
                <li><kbd>S</kbd> Set loop start</li>
                <li><kbd>E</kbd> Set loop end</li>
                <li><kbd>U</kbd> Toggle looping</li>
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
