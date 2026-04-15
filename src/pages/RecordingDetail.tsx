import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, FolderOpen } from 'lucide-react';
import { useRecordings } from '@/stores/recordings';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function RecordingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRecording } = useRecordings();
  const recording = id ? getRecording(id) : undefined;

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

      {/* Metadata */}
      <div className="px-5 mt-4 space-y-3">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{formatDuration(recording.durationMs)}</span>
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

      {/* Playback placeholder */}
      <div className="px-5 mt-6">
        <div className="rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Playback coming soon</p>
          <p className="text-xs text-text-tertiary">Audio capture & playback not yet implemented</p>
        </div>
      </div>
    </div>
  );
}
