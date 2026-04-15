import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, FolderOpen, Play, Pause, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecordings } from '@/stores/recordings';
import { usePlayback } from '@/hooks/use-playback';
import { Progress } from '@/components/ui/progress';

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function RecordingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecording } = useRecordings();
  const { activeId, isPlaying, positionMs, toggle, stop } = usePlayback();
  const recording = id ? getRecording(id) : undefined;

  const isThisPlaying = activeId === id && isPlaying;
  const isThisActive = activeId === id;

  // Stop playback when leaving this screen
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  if (!recording) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Recording not found
      </div>
    );
  }

  const date = new Date(recording.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const progress = isThisActive && recording.durationMs > 0
    ? (positionMs / recording.durationMs) * 100
    : 0;

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-12 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground mb-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight px-1">
          {recording.title || 'Untitled recording'}
        </h1>
      </header>

      {/* Playback controls */}
      <div className="px-5 mt-4">
        <div className="rounded-xl bg-card border border-border p-5">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => toggle(recording.id, recording.durationMs)}
              className="h-14 w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            >
              {isThisPlaying ? (
                <Pause className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
              )}
            </motion.button>

            <div className="flex-1 min-w-0 space-y-2">
              <Progress value={progress} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{isThisActive ? fmt(positionMs) : '0:00'}</span>
                <span>{fmt(recording.durationMs)}</span>
              </div>
            </div>

            {isThisActive && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={stop}
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
              >
                <Square className="h-4 w-4 text-foreground" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-5 mt-5 space-y-3">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{fmt(recording.durationMs)}</span>
          <span className="text-text-tertiary">·</span>
          <span>{recording.segmentCount} segment{recording.segmentCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{date}</span>
        </div>
        {recording.projectName && (
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <span>{recording.projectName}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {recording.tagLabels.length > 0 && (
        <div className="px-5 mt-5">
          <p className="text-xs font-medium text-text-secondary mb-2">Tags</p>
          <div className="flex gap-1.5 flex-wrap">
            {recording.tagLabels.map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      {recording.notePreview && (
        <div className="px-5 mt-5">
          <p className="text-xs font-medium text-text-secondary mb-2">Note</p>
          <div className="rounded-xl bg-card p-4">
            <p className="text-sm text-foreground leading-relaxed">{recording.notePreview}</p>
          </div>
        </div>
      )}
    </div>
  );
}
