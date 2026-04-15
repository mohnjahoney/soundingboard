// Core domain types for the audio ideation tool

export interface Project {
  id: string;
  name: string;
  icon?: string; // emoji or icon identifier
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface Recording {
  id: string;
  projectId?: string;
  title?: string;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
  segments: Segment[];
  moments: Moment[];
  notes: Note[];
  tags: Tag[];
}

export interface Segment {
  id: string;
  recordingId: string;
  index: number;
  startMs: number;
  endMs: number;
  createdAt: string;
}

export interface Moment {
  id: string;
  recordingId: string;
  timeMs: number;
  windowMs: number; // default radius around the point
  label?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  parentType: 'recording' | 'segment' | 'moment' | 'project';
  parentId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  label: string; // may include emoji
}

export interface AuditionItem {
  id: string;
  sourceType: 'recording' | 'segment' | 'moment';
  sourceId: string;
  order: number;
}

export interface Audition {
  id: string;
  name?: string;
  items: AuditionItem[];
  createdAt: string;
}

export interface Score {
  id: string;
  auditionItemId: string;
  value: number; // 0-6
  createdAt: string;
}

export interface Reaction {
  id: string;
  auditionItemId: string;
  content: string; // emoji or short phrase
  createdAt: string;
}

// Capture flow states
export type CaptureState = 'ready' | 'recording' | 'paused' | 'review';

export interface CaptureSession {
  state: CaptureState;
  currentSegmentIndex: number;
  elapsedMs: number;
  segments: Segment[];
}

// Summary type for lightweight list rendering
export interface RecordingSummary {
  id: string;
  projectId?: string;
  projectName?: string;
  title?: string;
  durationMs: number;
  createdAt: string;
  notePreview?: string;
  tagLabels: string[];
  segmentCount: number;
  momentCount: number;
}
