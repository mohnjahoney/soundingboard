import { useNavigate } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import type { Recording } from '@/types/domain';
import { usePlayback } from '@/hooks/use-playback';

import { useRecordings } from '@/stores/recordings';
import { useTags } from '@/stores/tags';
import { IconRenderer } from '@/lib/IconSystem';

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getNotePreview(recording: Recording): string {
  if (!recording.notes || recording.notes.length === 0) return 'No note';
  const text = recording.notes[0].text || '';
  return text.length > 80 ? text.slice(0, 80) + '…' : text;
}

export default function RecordingCard({ recording }: { recording: Recording }) {
  const navigate = useNavigate();
  const { activeId, isPlaying } = usePlayback();
  const { projects } = useRecordings();
  const { tags } = useTags();
  const isThisPlaying = activeId === recording.id && isPlaying;
  const duration = formatDuration(recording.durationMs);
  const date = new Date(recording.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const getTagById = (id: string) => tags.find(t => t.id === id);

  // const project = getProjectById(recording.projectId);
  const project = projects.find(p => p.id === recording.projectId);

  return (
    <button
      onClick={() => navigate(`/recordings/${recording.id}`)}
      className="w-full text-left rounded-xl bg-card p-4 transition-colors hover:bg-surface-hover cursor-pointer"
    >
      <div className="min-w-0">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {recording.title || 'Untitled recording'}
            </p>
            {project && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5 truncate">
                {project.icon && (
                  <span className="flex-shrink-0">
                    <IconRenderer config={project.icon} iconSize="small" />
                  </span>
                )}
                <span className="truncate">{project.name}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
              {getNotePreview(recording)}
            </p>
          </div>
          {isThisPlaying && (
            <Volume2 className="h-3.5 w-3.5 text-primary flex-shrink-0 animate-pulse mt-0.5" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-text-tertiary">
          <span>{duration}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>
      {recording.tagIds.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {recording.tagIds.map((id) => {
            const tag = getTagById(id);
            if (!tag) return null;
            return (
              <span key={id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                {tag.label}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}
