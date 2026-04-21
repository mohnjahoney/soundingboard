import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Square, Plus, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CaptureState } from '@/types/domain';
import { useRecordings } from '@/stores/recordings';
import { useRecorder } from '@/hooks/useRecorder';
import { IconRenderer } from '@/lib/IconSystem';
import { useTags } from '@/stores/tags';

type NoteMode = 'idle' | 'write' | 'dictate' | 'transcribe';

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: { 0: { transcript: string }; isFinal: boolean };
};

type SpeechRecognitionResultEvent = {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((ev: SpeechRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
};

function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

function isCursorEmbeddedBrowser(): boolean {
  return navigator.userAgent.includes('Cursor/') && navigator.userAgent.includes('Electron/');
}

export default function Capture() {
  const navigate = useNavigate();
  const { projects, addRecording } = useRecordings();
  const { tags, addTag } = useTags();
  const [state, setState] = useState<CaptureState>('ready');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [segmentCount, setSegmentCount] = useState(1);
  const [segmentMarkersMs, setSegmentMarkersMs] = useState<number[]>([]);
  const [noteText, setNoteText] = useState('');
  const [noteMode, setNoteMode] = useState<NoteMode>('idle');
  const [isListening, setIsListening] = useState(false);
  const [dictationError, setDictationError] = useState<string | null>(null);
  const dictationBlockedInRuntime = isCursorEmbeddedBrowser();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noteTextRef = useRef(noteText);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  noteTextRef.current = noteText;
  const { audioBlob, startRecording, stopRecording, pauseRecording, resumeRecording } = useRecorder();
  useEffect(() => {
    console.log("audioBlob changed:", audioBlob);
  }, [audioBlob]);

  useEffect(() => {
    if (state === 'recording') {
      intervalRef.current = setInterval(() => setElapsedMs((v) => v + 100), 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state]);

  // Focus note field when entering write mode
  useEffect(() => {
    if (noteMode === 'write') {
      noteTextareaRef.current?.focus();
    }
  }, [noteMode]);

  // Transcribe stub: only set placeholder when note is empty (do not clobber user text)
  useEffect(() => {
    if (noteMode !== 'transcribe') return;
    setNoteText((prev) =>
      prev.trim() === '' ? 'Transcription coming soon...' : prev
    );
  }, [noteMode]);

  // Web Speech API: start/stop with mode; merge transcripts from full results each event (avoids duplicate/jitter)
  useEffect(() => {
    if (noteMode !== 'dictate') return;
    if (dictationBlockedInRuntime) {
      setDictationError('Dictation is unavailable in Cursor preview. Use Chrome or Safari.');
      setNoteMode('write');
      return;
    }
    setDictationError(null);

    const Ctor = getSpeechRecognitionConstructor();
    // #region agent log
    fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H10',location:'src/pages/Capture.tsx:dictateEffect',message:'Dictate effect entered with runtime environment',data:{noteMode,hasCtor:Boolean(Ctor),visibilityState:document.visibilityState,language:navigator.language,isSecureContext,protocol:window.location.protocol,hostname:window.location.hostname,userAgent:navigator.userAgent},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!Ctor) {
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-1',hypothesisId:'H2',location:'src/pages/Capture.tsx:dictateEffect',message:'No constructor, falling back to write',data:{noteMode},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setNoteMode('write');
      return;
    }

    const prefix = noteTextRef.current;
    const recognition = new Ctor();
    let didStart = false;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    recognition.onstart = () => {
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H3',location:'src/pages/Capture.tsx:onstart',message:'Recognition onstart fired',data:{continuous:recognition.continuous,interimResults:recognition.interimResults,lang:recognition.lang},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    };

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      let sessionText = '';
      for (let i = 0; i < event.results.length; i++) {
        sessionText += event.results[i][0].transcript;
      }
      const glue = prefix && sessionText.trim() ? ' ' : '';
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H4',location:'src/pages/Capture.tsx:onresult',message:'Recognition result received',data:{resultsLength:event.results.length,sessionTextLength:sessionText.length,preview:sessionText.slice(0,100)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setNoteText(`${prefix}${glue}${sessionText}`);
    };

    recognition.onend = () => {
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H5',location:'src/pages/Capture.tsx:onend',message:'Recognition onend fired',data:{didStart,visibilityState:document.visibilityState},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setIsListening(false);
    };
    recognition.onerror = (ev: { error: string }) => {
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H11',location:'src/pages/Capture.tsx:onerror',message:'Recognition onerror fired with environment details',data:{error:ev.error,didStart,visibilityState:document.visibilityState,protocol:window.location.protocol,hostname:window.location.hostname,userAgent:navigator.userAgent},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setIsListening(false);
      setDictationError(
        ev.error === 'network'
          ? 'Dictation service is unavailable in this browser context. Try Chrome or Safari.'
          : `Dictation failed (${ev.error}).`
      );
    };

    try {
      recognition.start();
      didStart = true;
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H7',location:'src/pages/Capture.tsx:dictateEffect',message:'Recognition start called successfully',data:{didStart,lang:recognition.lang},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setIsListening(true);
    } catch {
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H8',location:'src/pages/Capture.tsx:dictateEffect',message:'Recognition start threw and fallback to write',data:{didStart,lang:recognition.lang},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setIsListening(false);
      setNoteMode('write');
      setDictationError('Dictation failed to start in this browser context.');
    }

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7575/ingest/829da6d3-87ba-471e-86c5-8ea6b8519a57',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2a05af'},body:JSON.stringify({sessionId:'2a05af',runId:'rerun-2',hypothesisId:'H9',location:'src/pages/Capture.tsx:cleanup',message:'Dictate effect cleanup running',data:{didStart,visibilityState:document.visibilityState},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
      }
      setIsListening(false);
    };
  }, [noteMode, dictationBlockedInRuntime]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${m}:${sec.toString().padStart(2, '0')}.${tenths}`;
  };

  // const handleRecord = () => setState('recording');
  const handleRecord = async () => {
    await startRecording();
    setElapsedMs(0);
    setSegmentCount(1);
    setSegmentMarkersMs([0]);
    setState('recording');
  };
  const handlePause = () => {
    pauseRecording();
    setState('paused');
  };
  const handleResume = () => {
    resumeRecording();
    setState('recording');
  };
  const handleNewSegment = () => {
    setSegmentMarkersMs((prev) => {
      if (prev[prev.length - 1] === elapsedMs) return prev;
      return [...prev, elapsedMs];
    });
    setSegmentCount((c) => c + 1);
    resumeRecording();
    setState('recording');
  };
  const handleFinish = () => {
    stopRecording();
    setState('review');
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

const handleSave = () => {
  console.log("handleSave audioBlob:", audioBlob);
  console.log('segmentMarkersMs:', segmentMarkersMs);
  const id = `r-${Date.now()}`;

  const now = new Date().toISOString();
  const normalizedMarkers = Array.from(new Set([0, ...segmentMarkersMs]))
    .filter((ms) => ms >= 0 && ms < elapsedMs)
    .sort((a, b) => a - b);

  const segments = normalizedMarkers.map((startMs, index) => ({
    id: `${id}-seg-${index}`,
    recordingId: id,
    index,
    startMs,
    endMs: normalizedMarkers[index + 1] ?? elapsedMs,
    createdAt: now,
  }));

  const tempAudioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;
  console.log("tempAudioUrl:", tempAudioUrl);

  addRecording({
    id,
    projectId: selectedProjectId,
    title: undefined,
    durationMs: elapsedMs,
    createdAt: now,
    updatedAt: now,
    tagIds: selectedTags,
    audioUrl: tempAudioUrl,
    segments,
    moments: [],
    notes: noteText.trim()
      ? [
          {
            id: crypto.randomUUID(),
            parent: {
              type: 'recording',
              id: id,
            },
            text: noteText.trim(),
            createdAt: now,
            updatedAt: now,
          },
        ]
      : [],
  });
  navigate('/');
};

  const handleAddTag = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const tag = addTag(trimmed); // returns existing or new Tag
    if (!selectedTags.includes(tag.id)) {
      setSelectedTags((prev) => [...prev, tag.id]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
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
                {noteMode === 'idle' ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (dictationBlockedInRuntime) {
                          setDictationError('Dictation is unavailable in Cursor preview. Use Chrome or Safari.');
                          setNoteMode('write');
                          return;
                        }
                        setDictationError(null);
                        setNoteMode('dictate');
                      }}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dictationBlockedInRuntime}
                      title={dictationBlockedInRuntime ? 'Dictation is unavailable in Cursor preview. Use Chrome or Safari.' : undefined}
                    >
                      🎤 Dictate
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteMode('write')}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
                    >
                      ✏️ Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoteMode('transcribe')}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
                    >
                      🧠 Transcribe
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {noteMode === 'dictate' && isListening && (
                      <p className="text-xs text-muted-foreground">Talk about it...</p>
                    )}
                    {noteMode === 'dictate' && dictationError && (
                      <p className="text-xs text-destructive">{dictationError}</p>
                    )}
                    {noteMode === 'write' && dictationBlockedInRuntime && dictationError && (
                      <p className="text-xs text-destructive">{dictationError}</p>
                    )}
                    <textarea
                      ref={noteTextareaRef}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="What were you thinking?"
                      rows={3}
                      className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-text-tertiary resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() => setNoteMode('idle')}
                      className="text-xs text-primary hover:underline"
                    >
                      Choose input method
                    </button>
                  </div>
                )}
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
                          <span>
                            {p.icon
                              ? <IconRenderer config={p.icon} iconSize="small" />
                              : '📁'}
                          </span>
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
                        <span>
                          {selectedProject.icon
                            ? <IconRenderer config={selectedProject.icon} iconSize="small" />
                            : '📁'}
                        </span>
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
                    {tags.filter((t) => !selectedTags.includes(t.id)).length > 0 && (
                      <div className="px-4 py-2 flex flex-wrap gap-1.5">
                        {tags
                          .filter((t) => !selectedTags.includes(t.id))
                          .map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => handleAddTag(tag.label)}
                              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground hover:bg-surface-hover transition-colors"
                            >
                              {tag.label}
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
                        {selectedTags.map((id) => {
                          const tag = tags.find((t) => t.id === id);
                          if (!tag) return null;
                          return (
                            <span key={id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                              {tag.label}
                            </span>
                          );
                        })}
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
                    {selectedTags.map((id) => {
                      const tag = tags.find((t) => t.id === id);
                      if (!tag) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => handleRemoveTag(id)}
                          className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-xs flex items-center gap-1"
                        >
                          {tag.label}
                          <X className="h-3 w-3" />
                        </button>
                      );
                    })}
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
