import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

interface PlaybackState {
  /** Currently playing recording ID, or null */
  activeId: string | null;
  /** Whether audio is currently playing (vs paused) */
  isPlaying: boolean;
  /** Current position in ms */
  positionMs: number;
  /** Total duration in ms */
  durationMs: number;
  /** Start or resume playback for a recording */
  play: (id: string, durationMs: number) => void;
  /** Pause playback, keeping position */
  pause: () => void;
  /** Stop playback entirely, reset position */
  stop: () => void;
  /** Toggle play/pause for a specific recording */
  toggle: (id: string, durationMs: number) => void;
}

const PlaybackContext = createContext<PlaybackState | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionRef = useRef(0); // avoid stale closures

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback((dur: number) => {
    clearTick();
    intervalRef.current = setInterval(() => {
      positionRef.current += 100;
      if (positionRef.current >= dur) {
        // Playback ended naturally
        positionRef.current = 0;
        setPositionMs(0);
        setIsPlaying(false);
        setActiveId(null);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      } else {
        setPositionMs(positionRef.current);
      }
    }, 100);
  }, [clearTick]);

  const play = useCallback((id: string, dur: number) => {
    // If switching recordings, reset position
    if (id !== activeId) {
      positionRef.current = 0;
      setPositionMs(0);
    }
    setActiveId(id);
    setDurationMs(dur);
    setIsPlaying(true);
    startTick(dur);
  }, [activeId, startTick]);

  const pause = useCallback(() => {
    clearTick();
    setIsPlaying(false);
  }, [clearTick]);

  const stop = useCallback(() => {
    clearTick();
    setIsPlaying(false);
    setActiveId(null);
    positionRef.current = 0;
    setPositionMs(0);
  }, [clearTick]);

  const toggle = useCallback((id: string, dur: number) => {
    if (activeId === id && isPlaying) {
      pause();
    } else {
      play(id, dur);
    }
  }, [activeId, isPlaying, pause, play]);

  // Cleanup on unmount
  useEffect(() => () => clearTick(), [clearTick]);

  return (
    <PlaybackContext.Provider value={{ activeId, isPlaying, positionMs, durationMs, play, pause, stop, toggle }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
}
