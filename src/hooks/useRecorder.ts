import { useState, useRef, useCallback } from 'react';

interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

export function useRecorder() {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    error: null,
  });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const startTime = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        console.log("onstop fired");
        const blob = new Blob(chunks.current, { type: recorder.mimeType });
        console.log("created blob size:", blob.size);
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        const finalDuration = Math.round((Date.now() - startTime.current) / 1000);
        setState((s) => ({ ...s, isRecording: false, isPaused: false, audioBlob: blob, duration: finalDuration }));
      };

      recorder.start();
      startTime.current = Date.now();
      setState({ isRecording: true, isPaused: false, duration: 0, audioBlob: null, error: null });

      timerRef.current = window.setInterval(() => {
        setState((s) => ({ ...s, duration: Math.round((Date.now() - startTime.current) / 1000) }));
      }, 500);
    } catch {
      setState((s) => ({ ...s, isPaused: false, error: 'Microphone access denied' }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("stopRecording fired");
    mediaRecorder.current?.stop();
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.pause();
      clearInterval(timerRef.current);
      setState((s) => ({ ...s, isRecording: false, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorder.current?.state === 'paused') {
      mediaRecorder.current.resume();
      setState((s) => ({ ...s, isRecording: true, isPaused: false }));

      timerRef.current = window.setInterval(() => {
        setState((s) => ({ ...s, duration: Math.round((Date.now() - startTime.current) / 1000) }));
      }, 500);
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isRecording: false, isPaused: false, duration: 0, audioBlob: null, error: null });
  }, []);

  return { ...state, startRecording, stopRecording, pauseRecording, resumeRecording, reset };
}
