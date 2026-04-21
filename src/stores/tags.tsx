

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { Tag } from '@/types/domain';

// --- Types ---
type TagsState = {
  tags: Tag[];
  addTag: (label: string) => Tag; // returns existing or new
  getTagById: (id: string) => Tag | undefined;
  getTagByLabel: (label: string) => Tag | undefined;
};

// --- Seed ---
const seedLabels = ['idea', 'groove', 'melody', 'weird', 'good'];

function makeTag(label: string): Tag {
  return {
    id: crypto.randomUUID(),
    label,
  };
}

const initialTags: Tag[] = seedLabels.map(makeTag);

// --- Context ---
const TagsContext = createContext<TagsState | null>(null);

// --- Provider ---
export function TagsProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<Tag[]>(initialTags);

  const getTagById = useCallback(
    (id: string) => tags.find((t) => t.id === id),
    [tags]
  );

  const getTagByLabel = useCallback(
    (label: string) => tags.find((t) => t.label.toLowerCase() === label.toLowerCase()),
    [tags]
  );

  const addTag = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return makeTag('');

    const existing = tags.find(
      (t) => t.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) return existing;

    const newTag = makeTag(trimmed);
    setTags((prev) => [newTag, ...prev]);
    return newTag;
  }, [tags]);

  return (
    <TagsContext.Provider
      value={{ tags, addTag, getTagById, getTagByLabel }}
    >
      {children}
    </TagsContext.Provider>
  );
}

// --- Hook ---
export function useTags() {
  const ctx = useContext(TagsContext);
  if (!ctx) throw new Error('useTags must be used within TagsProvider');
  return ctx;
}