import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { useRecordings } from '@/stores/recordings';
import { useState } from 'react';
import { generateIconConfig, IconRenderer } from '@/lib/IconSystem';
import {IconConfig} from '@/types/domain';

function rand<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Projects() {
  const navigate = useNavigate();
  const { projects, recordings, addProject } = useRecordings();

  const projectCounts = recordings.reduce<Record<string, number>>((acc, r) => {
    if (r.projectId) acc[r.projectId] = (acc[r.projectId] || 0) + 1;
    return acc;
  }, {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIcon, setNewProjectIcon] = useState<IconConfig>(generateIconConfig());

  return (
    <div className="min-h-screen pb-24">
      <header className="flex items-center justify-between px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        {/* <button className="p-2 -mr-2 text-primary opacity-50 cursor-not-allowed" onClick={() => setIsModalOpen(true)}> */}
        <button className="p-2 -mr-2 text-primary" onClick={() => setIsModalOpen(true)}>
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
            <span className="text-2xl">
              {typeof project.icon === 'string'
                ? project.icon
                : <IconRenderer config={project.icon as IconConfig} iconSize="medium" />}
            </span>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">New Project</h2>

            <div className="flex items-center gap-3 mb-4">
              <div
                className="cursor-pointer active:scale-90 transition hover:rotate-12"
                onClick={() => setNewProjectIcon(generateIconConfig())}
                title="Click to change icon"
              >
                <IconRenderer config={newProjectIcon} iconSize="medium" />
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Project name"
                className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (!newProjectName) return;
                    addProject(newProjectName, newProjectIcon);
                    setNewProjectName('');
                    setNewProjectIcon(generateIconConfig());
                    setIsModalOpen(false);
                  }
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // if (!newProjectName.trim()) return;
                  // addProject(newProjectName.trim(), '📁');
                  if (!newProjectName) return;
                  addProject(newProjectName, newProjectIcon);
                  setNewProjectName('');
                  setNewProjectIcon(generateIconConfig());
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
