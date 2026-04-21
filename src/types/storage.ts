import type {
  Project,
  Recording,
  Note,
  Tag,
} from './domain';

/**
 * Storage abstraction layer.
 * App logic depends only on this interface.
 * Implementations may use Supabase, IndexedDB, or native file storage.
 */
export interface StorageProvider {
  // Projects
  listProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'icon'>>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Recordings
  listRecordings(filter?: { projectId?: string }): Promise<Recording[]>;
  getRecording(id: string): Promise<Recording | null>;
  createRecording(recording: Omit<Recording, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recording>;
  updateRecording(id: string, updates: Partial<Recording>): Promise<Recording>;
  deleteRecording(id: string): Promise<void>;

  // Notes
  addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;
  updateNote(id: string, text: string): Promise<Note>;
  deleteNote(id: string): Promise<void>;

  // Tags
  listTags(): Promise<Tag[]>;
  createTag(label: string): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
}
