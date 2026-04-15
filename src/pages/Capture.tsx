import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, SquareIcon, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CaptureState } from '@/types/domain';

export default function Capture() {
  const navigate = useNavigate();
  const [state, setState] = useState<CaptureState>('ready');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [segmentCount, setSegmentCount] = useState(1);
  const [noteText, setNoteText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === 'recording') {
      intervalRef.current = setInterval(() => setElapsedMs((v) => v + 100), 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${m}:${sec.toString().padStart(2, '0')}.${tenths}`;
  };

  const handleRecord = () => setState('recording');
  const handlePause = () => setState('paused');
  const handleContinue = () => setState('recording');
  const handleNewSegment = () => {
    setSegmentCount((c) => c + 1);
    setState('recording');
  };
  const handleFinish = () => setState('review');
  const handleSave = () => navigate('/');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          {state === 'review' ? 'Review' : `Segment ${segmentCount}`}
        </span>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <AnimatePresence mode="wait">
          {state === 'review' ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center">
                <p className="text-3xl font-heading font-bold">{formatTime(elapsedMs)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {segmentCount} segment{segmentCount > 1 ? 's' : ''} captured
                </p>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="What were you thinking?"
                  rows={3}
                  className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Project assignment placeholder */}
              <button className="w-full flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3 text-sm text-muted-foreground">
                <span>Assign to project</span>
                <Plus className="h-4 w-4" />
              </button>

              {/* Tags placeholder */}
              <button className="w-full flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3 text-sm text-muted-foreground">
                <span>Add tags</span>
                <Plus className="h-4 w-4" />
              </button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-primary-foreground font-heading font-semibold text-base"
              >
                <Check className="h-5 w-5" />
                Save Recording
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="capture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-10"
            >
              {/* Timer */}
              <p className="text-5xl font-heading font-bold tabular-nums tracking-tight">
                {formatTime(elapsedMs)}
              </p>

              {/* Main control */}
              {state === 'ready' && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleRecord}
                  className="h-20 w-20 rounded-full bg-recording-active flex items-center justify-center shadow-lg shadow-recording-active/30"
                >
                  <div className="h-6 w-6 rounded-full bg-primary-foreground" />
                </motion.button>
              )}

              {state === 'recording' && (
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="h-20 w-20 rounded-full bg-recording-active flex items-center justify-center shadow-lg shadow-recording-active/30"
                  >
                    <Pause className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                  <button onClick={handlePause} className="text-sm text-muted-foreground font-medium">
                    Tap to pause
                  </button>
                </div>
              )}

              {state === 'paused' && (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={handleContinue}
                      className="h-16 w-16 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={handleFinish}
                      className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <SquareIcon className="h-5 w-5 text-foreground" />
                    </motion.button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleNewSegment}
                      className="text-sm text-primary font-medium px-4 py-2 rounded-lg bg-primary/10"
                    >
                      New Segment
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
