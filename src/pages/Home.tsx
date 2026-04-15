import { useNavigate } from 'react-router-dom';
import { Mic, FolderOpen, ListMusic, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecordings } from '@/stores/recordings';
import RecordingCard from '@/components/RecordingCard';

export default function Home() {
  const navigate = useNavigate();
  const { recordings, projects } = useRecordings();
  const recentRecordings = recordings.slice(0, 3);
  const unassigned = recordings.filter((r) => !r.projectId);

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
            <p className="text-xs text-muted-foreground">{projects.length}</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/recordings')}
          className="flex items-center gap-3 rounded-xl bg-card p-4 text-left transition-colors hover:bg-surface-hover"
        >
          <ListMusic className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Recordings</p>
            <p className="text-xs text-muted-foreground">{recordings.length}</p>
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
