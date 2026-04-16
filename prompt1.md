Build a new mobile-first web application for capturing, organizing, and revisiting audio ideas. This is an MVP for a creative audio ideation tool. It is not a DAW and should not feel like one.

Product positioning:
- This app is a thinking space for audio ideas
- It is for recording, organizing, annotating, and reviewing audio
- It should feel polished, simple, and creative
- It should not introduce DAW-style concepts like tracks, arrangement, global timeline editing, or detailed waveform editing

High-level UX principles:
- Mobile-first responsive design
- Clean and polished, but not overly playful or gimmicky
- Fast, low-friction interactions
- Non-destructive workflow
- Audio-first, but with strong support for text notes
- Content/data models must be separated from rendering/UI
- App logic must be separated from storage/provider details

Core domain concepts to use in code:
- Project
- Recording
- Segment
- Moment
- Note
- Tag
- AuditionItem
- Review
- Reaction

Definitions:
- Project: a container for related recordings, usually corresponding to a song or idea cluster
- Recording: one captured audio session, with associated metadata, notes, tags, and optional project assignment
- Segment: a bounded chunk of a recording, usually representing a take or contiguous section; created by capture structure, not by DAW-style editing
- Moment: a point-centered area of interest within a recording, with a default time window; used for highlights, recall, and later review
- Note: user expression attached to a parent entity; may contain text, audio, or both in the future, but for now text is sufficient in many flows
- Tag: short reusable label, user-defined, flat, optionally expressive, including emoji
- AuditionItem: a unit presented for evaluation/review, later derived from recordings, segments, or moments
- Review: a review session over audition items
- Reaction: a user reaction attached during review; more expressive than a numeric score

Architecture principles:
- The app must be designed around a storage abstraction/interface
- App logic should not depend directly on a specific backend provider
- Storage/provider details should be isolated behind interfaces
- Design for future provider swap:
  - current implementation can use Lovable/Supabase-compatible persistence
  - future implementation may use native local-device file storage and local metadata database
- Separate durable metadata from runtime playback state
- Do not treat object URLs or runtime playback helpers as durable domain data
- Keep code modular, readable, and extensible
- Prefer pure functions for business logic where practical
- Use TypeScript throughout

Current scope for Prompt 1:
Do not build the full app yet. Instead, create the foundational application structure, navigation, domain-oriented types, and top-level screens so the app has a clean product skeleton.

For this prompt, build these top-level screens/views only:
1. Home screen
   - prominent action to start a new recording
   - entry point to browse existing projects
   - entry point to browse unassigned / recent recordings

2. Recording capture screen
   - mobile-first layout
   - support a basic recording flow conceptually:
     - ready
     - recording
     - paused / decision point
     - review after capture
   - do not fully implement advanced segment/moment behavior yet, but structure the screen so it can support:
     - pause
     - continue
     - new segment
     - finish
   - after finishing capture, support:
     - adding/editing a text note
     - optional project assignment UI placeholder
     - optional tags UI placeholder

3. Projects screen
   - list of projects
   - each project shown as a simple card/list item
   - project card can show:
     - name
     - optional icon placeholder
     - count of recordings if available
   - no nested project hierarchy

4. Project detail / focus screen
   - show a project header
   - show list of recordings belonging to that project
   - include placeholder actions for:
     - record into this project
     - play highlights / recap
   - do not implement advanced recap behavior yet

5. Recordings browse screen
   - list recording cards
   - each recording card should display summary metadata, not full audio payload
   - recording card may show:
     - note text preview
     - duration
     - created time
     - tag previews
   - structure it so cards are lightweight summary views over recordings

What to include in this prompt:
- clean screen/component structure
- clean domain-oriented TypeScript types/interfaces
- top-level navigation and app flow
- placeholder storage interface definitions at a high level
- placeholder/mock data only where necessary to make screens render
- enough state structure to make the product shape clear

What not to include yet:
- no full backend implementation
- no Supabase coupling yet
- no full recording persistence implementation
- no real audition mode yet
- no collaboration yet
- no AI features yet
- no detailed waveform editing
- no DAW-style arranging or sequencing

Important design notes:
- Use “recording” in code, not “snippet”
- Use “moment” as a point-centered meaningful area, not a DAW region
- Use “segment” for bounded chunks, but do not expose DAW-style start/end editing UI
- Use “reaction” rather than “score” in the future review system
- Keep user-facing UI language simple and polished; internal domain names may differ slightly if needed, but keep internal naming consistent

Goal of this prompt:
Create a strong, clean foundation for the real app, with the right architecture, screen structure, and domain vocabulary, so later prompts can add storage, recording behavior, projects, moments, audition mode, and reactions without requiring major rewrites.