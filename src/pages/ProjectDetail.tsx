import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecordings } from '@/stores/recordings';
import RecordingCard from '@/components/RecordingCard';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, getProjectRecordings } = useRecordings();
  const project = projects.find((p) => p.id === id);
  const recordings = id ? getProjectRecordings(id) : [];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-12 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground mb-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 px-1">
          <span className="text-3xl">{project.icon || '📁'}</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-xs text-muted-foreground">
              {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Actions */}
      <div className="px-5 mt-4 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/capture')}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-primary-foreground text-sm font-semibold"
        >
          <Mic className="h-4 w-4" />
          Record
        </motion.button>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-secondary-foreground text-sm font-medium opacity-50 cursor-not-allowed">
          <Sparkles className="h-4 w-4" />
          Recap
        </button>
      </div>

      {/* Recordings */}
      <section className="px-5 mt-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">Recordings</h2>
        <div className="space-y-2">
          {recordings.length === 0 ? (
            <p className="text-sm text-text-tertiary py-8 text-center">No recordings yet</p>
          ) : (
            recordings.map((r) => (
              <RecordingCard key={r.id} recording={r} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
