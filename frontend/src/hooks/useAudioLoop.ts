import { useEffect, useRef, useState, useCallback } from 'react';
import type { Loop } from '../api/client';

interface UseAudioLoopOptions {
  audioUrl: string | null;
  activeLoop: Loop | null;
  isLooping: boolean;
}

export function useAudioLoop({ audioUrl, activeLoop, isLooping }: UseAudioLoopOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const clampVolume = useCallback((value: number) => Math.min(1, Math.max(0, value)), []);

  // Create audio element when URL changes
  useEffect(() => {
    if (!audioUrl) {
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audio.muted = isMuted;
    audioRef.current = audio;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl]);

  // Keep volume in sync with the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  // Handle looping logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLooping || !activeLoop) return;

    const checkLoop = () => {
      if (audio.currentTime >= activeLoop.end - 0.05) {
        audio.currentTime = activeLoop.start;
      }
    };

    audio.addEventListener('timeupdate', checkLoop);
    return () => audio.removeEventListener('timeupdate', checkLoop);
  }, [activeLoop, isLooping]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolumeSafe = useCallback(
    (value: number) => {
      const next = clampVolume(value);
      setVolume(next);
      if (next > 0) setIsMuted(false);
    },
    [clampVolume]
  );

  const adjustVolume = useCallback(
    (delta: number) => {
      setVolume((prev) => clampVolume(prev + delta));
      setIsMuted(false);
    },
    [clampVolume]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    volume,
    setVolume: setVolumeSafe,
    adjustVolume,
    isMuted,
    toggleMute,
  };
}
