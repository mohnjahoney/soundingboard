import { Recording } from '@/types/domain';
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
  play: (id: string, audioUrl: string, durationMs?: number) => Promise<void>;
  /** Pause playback, keeping position */
  pause: () => void;
  /** Stop playback entirely, reset position */
  stop: () => void;
  /** Toggle play/pause for a specific recording */
  // toggle: (id: string, audioBlobUrl: string, durationMs?: number) => Promise<void>;
  toggle: (recording: Recording) => Promise<void>;
}

const PlaybackContext = createContext<PlaybackState | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressLogRef = useRef<number[]>([]);

  const detachAudioListeners = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.ontimeupdate = null;
    audio.onloadedmetadata = null;
    audio.onplay = null;
    audio.onpause = null;
    audio.onended = null;
    audio.onerror = null;
  }, []);

  const stopProgressLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startProgressLoop = useCallback((audio: HTMLAudioElement) => {
    stopProgressLoop();

    const tick = () => {
      // setPositionMs(Math.round(audio.currentTime * 1000));
      setPositionMs(audio.currentTime * 1000);
      const progressMs = audio.currentTime * 1000;
        progressLogRef.current.push(progressMs);

      // setPositionMs(Math.round(audio.currentTime * 1000));
      // setPositionMs(audio.currentTime * 1000);
      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopProgressLoop]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    stopProgressLoop();
    setIsPlaying(false);
    setActiveId(null);
    setPositionMs(0);
  }, [stopProgressLoop]);

  const attachAudioListeners = useCallback((audio: HTMLAudioElement, id: string) => {
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDurationMs(Math.round(audio.duration * 1000));
      }
    };

    // audio.ontimeupdate = () => {
    //   setPositionMs(Math.round(audio.currentTime * 1000));
    // };
    audio.ontimeupdate = null;

    audio.onplay = () => {
      setActiveId(id);
      setIsPlaying(true);
      startProgressLoop(audio);
    };

    audio.onpause = () => {
      setIsPlaying(false);
      stopProgressLoop();
    };

    audio.onended = () => {
      stopProgressLoop();
      console.log('progress log:', progressLogRef.current);
      setIsPlaying(false);
      setActiveId(null);
      setPositionMs(0);
      audio.currentTime = 0;
    };

    audio.onerror = () => {
      stopProgressLoop();
      setIsPlaying(false);
      setActiveId(null);
      setPositionMs(0);
    };
  }, [startProgressLoop, stopProgressLoop]);

  const play = useCallback(async (id: string, audioUrl: string, fallbackDurationMs?: number) => {

    if (!audioUrl) return;

    let audio = audioRef.current;
    const isSameRecording = activeId === id;

    if (!audio || !isSameRecording) {
      if (audio) {
        detachAudioListeners(audio);
        audio.pause();
        audio.currentTime = 0;
      }

      audio = new Audio(audioUrl);
      progressLogRef.current = [];
      audioRef.current = audio;
      setPositionMs(0);
      setDurationMs(0);
      // setDurationMs(fallbackDurationMs ?? 0);
      attachAudioListeners(audio, id);
    }

    setActiveId(id);

    try {
      await audio.play();
    } catch (error) {
      console.error('Audio playback failed', error);
      setIsPlaying(false);
      setActiveId(null);
      setPositionMs(0);
    }
  }, [activeId, attachAudioListeners, detachAudioListeners]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async (recording: Recording) => {
    if (activeId === recording.id && isPlaying) {
      pause();
      return;
    }

    if (!recording.audioUrl) {
      console.warn('Recording has no audioUrl for playback', recording);
      return;
    }

    await play(recording.id, recording.audioUrl, recording.durationMs);
  }, [activeId, isPlaying, pause, play]);

  useEffect(() => {
    return () => {
      stopProgressLoop();
      const audio = audioRef.current;
      if (audio) {
        detachAudioListeners(audio);
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [detachAudioListeners, stopProgressLoop]);

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
