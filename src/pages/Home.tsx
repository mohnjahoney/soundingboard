import { useNavigate } from 'react-router-dom';
import { Mic, FolderOpen, ListMusic, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProjects, mockRecordings } from '@/data/mock';

export default function Home() {
  const navigate = useNavigate();
  const recentRecordings = mockRecordings.slice(0, 3);
  const unassigned = mockRecordings.filter((r) => !r.projectId);

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Soundboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Capture what you hear in your head.</p>
      </header>

      {/* Record CTA */}
      <div className="px-5 mb-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/capture')}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-primary-foreground font-heading font-semibold text-lg shadow-lg shadow-primary/20 transition-colors"
        >
          <Mic className="h-5 w-5" />
          New Recording
        </motion.button>
      </div>

      {/* Quick links */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-3 rounded-xl bg-card p-4 text-left transition-colors hover:bg-surface-hover"
        >
          <FolderOpen className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Projects</p>
            <p className="text-xs text-muted-foreground">{mockProjects.length}</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/recordings')}
          className="flex items-center gap-3 rounded-xl bg-card p-4 text-left transition-colors hover:bg-surface-hover"
        >
          <ListMusic className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Recordings</p>
            <p className="text-xs text-muted-foreground">{mockRecordings.length}</p>
          </div>
        </button>
      </div>

      {/* Recent recordings */}
      <section className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Recent</h2>
          <button
            onClick={() => navigate('/recordings')}
            className="flex items-center gap-1 text-xs text-primary font-medium"
          >
            See all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {recentRecordings.map((r) => (
            <RecordingCard key={r.id} recording={r} />
          ))}
        </div>
      </section>

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <section className="px-5">
          <h2 className="text-base font-semibold mb-3">Unassigned</h2>
          <div className="space-y-2">
            {unassigned.map((r) => (
              <RecordingCard key={r.id} recording={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RecordingCard({ recording }: { recording: typeof mockRecordings[0] }) {
  const duration = formatDuration(recording.durationMs);
  const date = new Date(recording.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="rounded-xl bg-card p-4 transition-colors hover:bg-surface-hover cursor-pointer">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">
            {recording.title || recording.notePreview || 'Untitled recording'}
          </p>
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
      </div>
      {recording.tagLabels.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {recording.tagLabels.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
