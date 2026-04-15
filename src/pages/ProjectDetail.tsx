import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProjects, mockRecordings } from '@/data/mock';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = mockProjects.find((p) => p.id === id);
  const recordings = mockRecordings.filter((r) => r.projectId === id);

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
        <button className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-secondary-foreground text-sm font-medium">
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
            recordings.map((r) => {
              const s = Math.floor(r.durationMs / 1000);
              const dur = `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
              const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={r.id}
                  className="rounded-xl bg-card p-4 transition-colors hover:bg-surface-hover cursor-pointer"
                >
                  <p className="text-sm font-medium truncate">
                    {r.title || r.notePreview || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                    <span>{dur}</span>
                    <span>·</span>
                    <span>{date}</span>
                  </div>
                  {r.tagLabels.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {r.tagLabels.map((tag) => (
                        <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
