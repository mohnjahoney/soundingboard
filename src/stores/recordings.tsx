import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { RecordingSummary, Project } from '@/types/domain';
import { mockRecordings, mockProjects } from '@/data/mock';

interface RecordingsState {
  recordings: RecordingSummary[];
  projects: Project[];
  allTags: string[];
  addRecording: (r: RecordingSummary) => void;
  getRecording: (id: string) => RecordingSummary | undefined;
  getProjectRecordings: (projectId: string) => RecordingSummary[];
  addProject: (p: Project) => void;
}

const RecordingsContext = createContext<RecordingsState | null>(null);

export function RecordingsProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<RecordingSummary[]>(mockRecordings);
  const [projects] = useState<Project[]>(mockProjects);

  const allTags = Array.from(
    new Set(recordings.flatMap((r) => r.tagLabels))
  ).filter(Boolean);

  const addRecording = useCallback((r: RecordingSummary) => {
    setRecordings((prev) => [r, ...prev]);
  }, []);

  const getRecording = useCallback(
    (id: string) => recordings.find((r) => r.id === id),
    [recordings]
  );

  const getProjectRecordings = useCallback(
    (projectId: string) => recordings.filter((r) => r.projectId === projectId),
    [recordings]
  );

  const addProject = useCallback((p: Project) => {
    // placeholder — not yet used
  }, []);

  return (
    <RecordingsContext.Provider
      value={{ recordings, projects, allTags, addRecording, getRecording, getProjectRecordings, addProject }}
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
