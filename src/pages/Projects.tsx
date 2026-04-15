import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { useRecordings } from '@/stores/recordings';

export default function Projects() {
  const navigate = useNavigate();
  const { projects, recordings } = useRecordings();

  const projectCounts = recordings.reduce<Record<string, number>>((acc, r) => {
    if (r.projectId) acc[r.projectId] = (acc[r.projectId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-24">
      <header className="flex items-center justify-between px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <button className="p-2 -mr-2 text-primary opacity-50 cursor-not-allowed">
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <div className="px-5 space-y-2">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="w-full flex items-center gap-4 rounded-xl bg-card p-4 text-left transition-colors hover:bg-surface-hover"
          >
            <span className="text-2xl">{project.icon || '📁'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{project.name}</p>
              <p className="text-xs text-muted-foreground">
                {projectCounts[project.id] || 0} recording{(projectCounts[project.id] || 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-text-tertiary flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
