import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Square, Plus, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CaptureState } from '@/types/domain';
import { useRecordings } from '@/stores/recordings';

export default function Capture() {
  const navigate = useNavigate();
  const { projects, allTags, addRecording } = useRecordings();
  const [state, setState] = useState<CaptureState>('ready');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [segmentCount, setSegmentCount] = useState(1);
  const [noteText, setNoteText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === 'recording') {
      intervalRef.current = setInterval(() => setElapsedMs((v) => v + 100), 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${m}:${sec.toString().padStart(2, '0')}.${tenths}`;
  };

  const handleRecord = () => setState('recording');
  const handlePause = () => setState('paused');
  const handleResume = () => setState('recording');
  const handleNewSegment = () => {
    setSegmentCount((c) => c + 1);
    setState('recording');
  };
  const handleFinish = () => setState('review');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleSave = () => {
    const id = `r-${Date.now()}`;
    addRecording({
      id,
      projectId: selectedProjectId,
      projectName: selectedProject?.name,
      title: noteText.slice(0, 40) || undefined,
      durationMs: elapsedMs,
      createdAt: new Date().toISOString(),
      notePreview: noteText || undefined,
      tagLabels: selectedTags,
      segmentCount,
      momentCount: 0,
    });
    navigate('/');
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          {state === 'review' ? 'Review' : `Segment ${segmentCount}`}
        </span>
        <div className="w-9" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <AnimatePresence mode="wait">
          {state === 'review' ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm space-y-5"
            >
              <div className="text-center">
                <p className="text-3xl font-heading font-bold">{formatTime(elapsedMs)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {segmentCount} segment{segmentCount > 1 ? 's' : ''} captured
                </p>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1.5 block">Note</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="What were you thinking?"
                  rows={3}
                  className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Project assignment */}
              <div>
                {showProjectPicker ? (
                  <div className="rounded-xl bg-card border border-border overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-medium text-text-secondary">Select project</span>
                      <button onClick={() => setShowProjectPicker(false)} className="p-1 text-muted-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <button
                        onClick={() => { setSelectedProjectId(undefined); setShowProjectPicker(false); }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-surface-hover transition-colors text-muted-foreground"
                      >
                        No project
                      </button>
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedProjectId(p.id); setShowProjectPicker(false); }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-hover transition-colors flex items-center gap-2 ${selectedProjectId === p.id ? 'text-primary' : 'text-foreground'}`}
                        >
                          <span>{p.icon || '📁'}</span>
                          <span>{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowProjectPicker(true)}
                    className="w-full flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3 text-sm"
                  >
                    {selectedProject ? (
                      <span className="text-foreground flex items-center gap-2">
                        <span>{selectedProject.icon || '📁'}</span>
                        {selectedProject.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Assign to project</span>
                    )}
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Tags */}
              <div>
                {showTagPicker ? (
                  <div className="rounded-xl bg-card border border-border overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
                      <span className="text-xs font-medium text-text-secondary">Tags</span>
                      <button onClick={() => setShowTagPicker(false)} className="p-1 text-muted-foreground">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* New tag input */}
                    <div className="px-4 py-2 border-b border-border">
                      <input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(newTag); }}
                        placeholder="Type a new tag…"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-text-tertiary focus:outline-none"
                      />
                    </div>
                    {/* Existing tags */}
                    {allTags.filter((t) => !selectedTags.includes(t)).length > 0 && (
                      <div className="px-4 py-2 flex flex-wrap gap-1.5">
                        {allTags.filter((t) => !selectedTags.includes(t)).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleAddTag(tag)}
                            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground hover:bg-surface-hover transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagPicker(true)}
                    className="w-full flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3 text-sm"
                  >
                    {selectedTags.length > 0 ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedTags.map((tag) => (
                          <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Add tags</span>
                    )}
                    <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                )}

                {/* Selected tags with remove */}
                {selectedTags.length > 0 && !showTagPicker && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {selectedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-xs flex items-center gap-1"
                      >
                        {tag}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-primary-foreground font-heading font-semibold text-base"
              >
                <Check className="h-5 w-5" />
                Save Recording
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="capture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-10"
            >
              {/* Timer */}
              <p className="text-5xl font-heading font-bold tabular-nums tracking-tight">
                {formatTime(elapsedMs)}
              </p>

              {/* Ready state — tap to start */}
              {state === 'ready' && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleRecord}
                  className="h-20 w-20 rounded-full bg-recording-active flex items-center justify-center shadow-lg shadow-recording-active/30"
                >
                  <div className="h-6 w-6 rounded-full bg-primary-foreground" />
                </motion.button>
              )}

              {/* Recording state — pulsing button, tap to pause */}
              {state === 'recording' && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handlePause}
                  className="h-20 w-20 rounded-full bg-recording-active flex items-center justify-center shadow-lg shadow-recording-active/30"
                >
                  <motion.div
                    className="absolute h-20 w-20 rounded-full bg-recording-active"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  />
                  <Pause className="h-7 w-7 text-primary-foreground relative z-10" />
                </motion.button>
              )}

              {/* Paused state — resume, finish, new segment */}
              {state === 'paused' && (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={handleResume}
                      className="h-16 w-16 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={handleFinish}
                      className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Square className="h-5 w-5 text-foreground" />
                    </motion.button>
                  </div>
                  <button
                    onClick={handleNewSegment}
                    className="text-sm text-primary font-medium px-4 py-2 rounded-lg bg-primary/10"
                  >
                    New Segment
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
