import { useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import type { RecordingSummary } from '@/types/domain';
import { usePlayback } from '@/hooks/use-playback';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function RecordingCard({ recording }: { recording: RecordingSummary }) {
  const navigate = useNavigate();
  const { activeId, isPlaying } = usePlayback();
  const isThisPlaying = activeId === recording.id && isPlaying;
  const duration = formatDuration(recording.durationMs);
  const date = new Date(recording.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      onClick={() => navigate(`/recordings/${recording.id}`)}
      className="w-full text-left rounded-xl bg-card p-4 transition-colors hover:bg-surface-hover cursor-pointer"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate flex-1">
            {recording.title || recording.notePreview || 'Untitled recording'}
          </p>
          {isThisPlaying && (
            <Volume2 className="h-3.5 w-3.5 text-primary flex-shrink-0 animate-pulse" />
          )}
        </div>
        {recording.notePreview && recording.title && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{recording.notePreview}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-xs text-text-tertiary">
          <span>{duration}</span>
          <span>·</span>
          <span>{date}</span>
          {recording.projectName && (
            <>
              <span>·</span>
              <span className="text-text-secondary">{recording.projectName}</span>
            </>
          )}
        </div>
      </div>
      {recording.tagLabels.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {recording.tagLabels.map((tag) => (
            <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
