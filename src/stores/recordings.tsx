import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Recording, Project, IconConfig } from '@/types/domain';
import { mockRecordings, mockProjects } from '@/data/mock';
import { now } from '@/lib/utils';

interface RecordingsState {
  recordings: Recording[];
  projects: Project[];
  addRecording: (r: Recording) => void;
  updateRecording: (id: string, updates: Partial<Recording>) => void;
  getRecording: (id: string) => Recording | undefined;
  getProjectRecordings: (projectId: string) => Recording[];
  addProject: (name: string, icon: IconConfig) => void;
  assignRecordingToProject: (recordingId: string, projectId?: string) => void;
}

const RecordingsContext = createContext<RecordingsState | null>(null);

export function RecordingsProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const addRecording = useCallback((r: Recording) => {
    setRecordings((prev) => [r, ...prev]);
  }, []);

  const updateRecording = useCallback((id: string, updates: Partial<Recording>) => {
    setRecordings((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...updates, updatedAt: now() }
          : r
      )
    );
  }, []);

  const getRecording = useCallback(
    (id: string) => recordings.find((r) => r.id === id),
    [recordings]
  );

  const getProjectRecordings = useCallback(
    (projectId: string) => recordings.filter((r) => r.projectId === projectId),
    [recordings]
  );

  const addProject = useCallback((name: string, icon: IconConfig) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      icon,
      createdAt: now(),
      updatedAt: now(),
    };

    setProjects((prev) => [newProject, ...prev]);
  }, []);

  const assignRecordingToProject = useCallback((recordingId: string, projectId?: string) => {
    setRecordings((prev) =>
      prev.map((r) =>
        r.id === recordingId
          ? { ...r, projectId }
          : r
      )
    );
  }, []);

  return (
    <RecordingsContext.Provider
      value={{ recordings, projects, addRecording, updateRecording, getRecording, getProjectRecordings, addProject, assignRecordingToProject }}
    >
      {children}
    </RecordingsContext.Provider>
  );
}

export function useRecordings() {
  const ctx = useContext(RecordingsContext);
  if (!ctx) throw new Error('useRecordings must be used within RecordingsProvider');
  return ctx;
}
