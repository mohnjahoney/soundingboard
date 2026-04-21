// Core domain types for the audio ideation tool

export type Transform =
  | { type: 'scale'; value: number }
  | { type: 'rotate'; deg: number }
  | { type: 'translate'; x: number; y: number };

export type Layer = {
  shape: 'circle' | 'square';
  color: string;
  transforms: Transform[];
  reflect?: 'x' | 'y';
};

export type IconConfig = {
  layers: Layer[];
};

export type IconSize = 'small' | 'medium' | 'large';

export const ICON_SIZE_PIXELS: Record<IconSize, number> = {
  small: 24,
  medium: 72,
  large: 120,
};

export interface Project {
  id: string;
  name: string;
  icon: IconConfig;
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface Recording {
  id: string;
  title?: string;
  audioUrl?: string;
  projectId?: string;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
  segments: Segment[];
  moments: Moment[];
  notes: Note[];
  tagIds: string[];
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
  parent: {
    type: 'recording' | 'segment' | 'moment' | 'project';
    id: string;
  }
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
