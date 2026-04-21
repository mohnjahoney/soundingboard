import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { Project, IconConfig } from '@/types/domain';
import { now } from '@/lib/utils';
import { generateIconConfig } from '@/lib/IconSystem';

type ProjectsState = {
  projects: Project[];
  addProject: (name: string, icon: IconConfig) => void;
};

const mockProjects: Project[] = [];

const ProjectsContext = createContext<ProjectsState | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const addProject = useCallback((name: string, icon: IconConfig) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      icon: icon,
      createdAt: now(),
      updatedAt: now(),
    };

    setProjects((prev) => [newProject, ...prev]);
  }, []);

  return (
    <ProjectsContext.Provider value={{ projects, addProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
};
