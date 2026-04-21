TECHNICAL HANDOFF SUMMARY — AUDIO RECORDING & PLAYBACK (React App)

CONTEXT
-------
You are working on a React + TypeScript app for capturing, organizing, and playing back audio recordings with metadata (projects, tags, notes, segments).

Recent focus:
- Audio recording (MediaRecorder)
- Playback (HTMLAudioElement + custom hook)
- Timeline UI (progress bar + segment markers)
- Debugging jitter / visual instability

---

CURRENT ARCHITECTURE

1. RECORDING FLOW
-----------------
File: useRecorder.ts

- Uses MediaRecorder
- Single continuous recording session (important design decision)
- Pause/resume uses MediaRecorder.pause() / resume()
- Produces ONE audioBlob at the end

Segments:
- Not separate audio blobs
- Stored as metadata:
  segmentMarkersMs: number[]
- Converted at save time into:
  segments: Segment[] with startMs / endMs

---

2. CAPTURE → SAVE
-----------------
File: Capture.tsx

Key behavior:
- segmentMarkersMs tracked during recording
- On save:
  - normalized markers created
  - segments[] constructed from markers + elapsedMs
  - recording saved with:
    - audioUrl (blob URL)
    - segments[]
    - metadata

Important:
- recording.durationMs comes from elapsed recording time
- this may NOT exactly match actual decoded audio duration

---

3. PLAYBACK SYSTEM
------------------
File: use-playback.tsx

Core state:
- activeId
- isPlaying
- positionMs (driven by RAF)
- durationMs (from audio metadata)

Mechanics:
- HTMLAudioElement used directly
- requestAnimationFrame loop updates:
    positionMs = audio.currentTime * 1000

- audio.onloadedmetadata sets:
    durationMs = audio.duration * 1000

IMPORTANT BUG SOURCE (recently fixed):
- Previously used fallback duration (recording.durationMs)
- Now should rely ONLY on audio.duration once loaded

---

4. TIMELINE UI
--------------
File: RecordingDetail.tsx

Progress calculation:
    progress = positionMs / durationMs

Segment markers:
    derived from recording.segments[].startMs

Visuals:
- Progress bar uses <Progress /> component
- Segment markers rendered as overlay "gaps"

---

5. PROGRESS COMPONENT
---------------------
File: ui/progress.tsx

Key implementation:
    transform: translateX(-${100 - value}%)

Important detail:
- Previously had:
    transition-all
- Now removed

Implication:
- No CSS easing currently
- Motion comes entirely from RAF updates

---

RECENT DEBUGGING FINDINGS

1. RAF LOOP IS HEALTHY
----------------------
- Logged positionMs over time
- Data shows:
  - mostly linear increase
  - ~16ms increments (60fps)
  - no oscillation or instability

Conclusion:
→ timing signal is good

---

2. MAJOR JITTER CAUSE #1: DURATION MISMATCH
-------------------------------------------
Observed behavior:
- progress bar fills partially, then jumps to end

Root cause:
- mismatch between:
    recording.durationMs
    vs
    audio.duration

Fix:
- use ONLY audio.duration during playback
- avoid switching denominator mid-playback

---

3. MAJOR JITTER CAUSE #2: LAYOUT SHIFT
--------------------------------------
Observed:
- stop button disappears at end
- progress bar resizes

Effect:
→ visual "jump" at end of playback

Fix:
- keep stop button persistent
- disable instead of removing

---

4. SAFARI VS CHROME
-------------------
- Chrome: smooth
- Safari: jittery

Conclusion:
- Safari audio timing / rendering is less stable
- not purely a logic issue

---

5. STARTUP / EARLY FRAME WEIRDNESS
----------------------------------
Logs show:
- initial flat zeros
- delayed ramp-up
- brief plateau ~200ms

Interpretation:
- audio.currentTime not reliable immediately after play()
- normal browser behavior

---

CURRENT STATE

Working:
- recording pipeline
- playback pipeline
- segment markers
- smooth-ish progress (Chrome)

Remaining issues:
- Safari jitter
- slight startup delay
- minor visual instability

---

KEY DESIGN DECISIONS

1. Single audioBlob per recording (NOT per segment)
2. Segments stored as metadata (startMs/endMs)
3. Playback driven by RAF + audio.currentTime
4. No manual easing (CSS transitions removed)

---

NEXT POSSIBLE IMPROVEMENTS

1. Stabilize duration usage
   - Ensure UI never switches denominator mid-playback

2. Optional: decouple UI animation from audio clock
   - simulate time via performance.now()
   - occasionally resync with audio.currentTime

3. Safari-specific smoothing
   - slight interpolation between frames

4. Progress component refinement
   - possibly reintroduce controlled easing
   - or clamp large jumps

5. UX polish
   - loading state before metadata ready
   - smoother start of playback

---

OPEN QUESTIONS

- Should we reintroduce light CSS easing?
- Should playback be fully driven by simulated time instead of audio.currentTime?
- How important is perfect Safari smoothness?

---

END STATE SUMMARY

The system is now:
- structurally correct
- data-consistent
- mostly smooth

Remaining issues are:
- rendering polish
- browser-specific behavior
- UX refinement