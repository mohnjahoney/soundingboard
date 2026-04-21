import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, FolderOpen, Play, Pause, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecordings } from '@/stores/recordings';
import { useTags } from '@/stores/tags';
import { usePlayback } from '@/hooks/use-playback';
import { Progress } from '@/components/ui/progress';

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

type NoteViewState = 'static' | 'mode' | 'editing';

export default function RecordingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecording, projects } = useRecordings();
  const { tags } = useTags();
  const { activeId, isPlaying, positionMs, durationMs, toggle, stop } = usePlayback();
  const recording = id ? getRecording(id) : undefined;
  const [noteViewState, setNoteViewState] = useState<NoteViewState>('static');
  const noteContainerRef = useRef<HTMLDivElement | null>(null);

  const isThisPlaying = activeId === id && isPlaying;
  const isThisActive = activeId === id;

  // const effectiveDurationMs = isThisActive && durationMs > 0 ? durationMs : recording?.durationMs ?? 0;
  const totalDurationMs = isThisActive
  ? durationMs
  : recording.durationMs;

  // Stop playback when leaving this screen
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  useEffect(() => {
    if (noteViewState === 'static') return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!noteContainerRef.current?.contains(target)) {
        setNoteViewState('static');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [noteViewState]);

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

  // const progress = isThisActive && effectiveDurationMs > 0
  //   ? Math.min(100, (positionMs / effectiveDurationMs) * 100)
  //   : 0;
  const progress =
  isThisActive && totalDurationMs > 0
    ? Math.min(100, (positionMs / totalDurationMs) * 100)
    : 0;

  const segmentMarkersMs = recording.segments
    .map((segment) => segment.startMs)
    .filter((ms) => ms > 0 && ms < totalDurationMs);

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
              // onClick={() => toggle(recording.id, recording.durationMs)}
              // onClick={() => recording.audioBlobUrl && toggle(recording.id, recording.audioBlobUrl, recording.durationMs)}
              onClick={() => recording.audioUrl && toggle(recording)}
              className="h-14 w-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            >
              {isThisPlaying ? (
                <Pause className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
              )}
            </motion.button>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="relative h-5">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                  <Progress value={progress} className="h-1.5" />
                </div>
                {segmentMarkersMs.map((markerMs) => {
                  const left = (markerMs / totalDurationMs) * 100;
                  return (
                    <span
                      key={markerMs}
                      // className="absolute top-1/2 z-10 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
                      className="absolute top-1/2 z-10 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-sm"
                      style={{ left: `${left}%` }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{isThisActive ? fmt(positionMs) : '0:00'}</span>
                <span>{fmt(totalDurationMs)}</span>
              </div>
              <div className="text-xs text-red-500">
                markers: {JSON.stringify(segmentMarkersMs)}
              </div>
            </div>

            <motion.button
              initial={false}
              animate={{ opacity: isThisActive ? 1 : 0.4, scale: 1 }}
              whileTap={isThisActive ? { scale: 0.9 } : undefined}
              onClick={isThisActive ? stop : undefined}
              disabled={!isThisActive}
              aria-disabled={!isThisActive}
              className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 disabled:cursor-not-allowed"
            >
              <Square className="h-4 w-4 text-foreground" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-5 mt-5 space-y-3">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{fmt(totalDurationMs)}</span>
          <span className="text-text-tertiary">·</span>
          <span>{recording.segments.length} segment{recording.segments.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{date}</span>
        </div>
        {recording.projectId && (
          (() => {
            const project = projects.find(p => p.id === recording.projectId);
            return project ? (
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <FolderOpen className="h-4 w-4 flex-shrink-0" />
                <span>{project.name}</span>
              </div>
            ) : null;
          })()
        )}
      </div>

      {/* Tags */}
      {recording.tagIds && recording.tagIds.length > 0 && (
        <div className="px-5 mt-5">
          <p className="text-xs font-medium text-text-secondary mb-2">Tags</p>
          <div className="flex gap-1.5 flex-wrap">
            {recording.tagIds.map((id) => {
              const tag = tags.find(t => t.id === id);
              if (!tag) return null;
              return (
                <span key={id} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  {tag.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Note */}
      {recording.notes.length > 0 && (
        <div className="px-5 mt-5">
          <p className="text-xs font-medium text-text-secondary mb-2">Note</p>
          <div ref={noteContainerRef} className="rounded-xl bg-card p-4">
            {noteViewState === 'static' && (
              <div onClick={() => setNoteViewState('mode')}>
                <p className="text-sm text-foreground leading-relaxed">{recording.notes[0].text}</p>
              </div>
            )}
            {noteViewState === 'mode' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNoteViewState('editing')}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-foreground"
                >
                  🎤 Dictate
                </button>
                <button
                  type="button"
                  onClick={() => setNoteViewState('editing')}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-foreground"
                >
                  ✏️ Write
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
