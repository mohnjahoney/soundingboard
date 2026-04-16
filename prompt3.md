Extend the existing app by implementing playback for recordings in a clean, reliable way. Preserve the current architecture and domain model.

Important constraints:
- Do not redesign the overall architecture
- Do not introduce backend-specific coupling
- Keep storage/provider details abstracted
- Keep the UI mobile-first and simple
- Focus on making playback real and reliable before adding polish

Primary goals:

1. Implement playback in the recording detail view
   - A user should be able to open a recording and play it
   - They should also be able to pause or stop playback
   - Playback controls should be clear and minimal

2. Keep playback state clean and correct
   - Only one recording should play at a time
   - Tapping play on the current recording should toggle play/pause or play/stop in a consistent way
   - Leaving the detail view should stop playback
   - Navigating to another recording should stop the previous recording

3. Make UI state match audio state
   - Buttons/icons/labels should update immediately and correctly
   - Avoid any state where the UI says audio is stopped while it is still playing, or vice versa
   - Handle playback ending naturally and return UI to a clean stopped state

4. Keep code organized
   - Keep playback logic readable and reasonably isolated
   - Avoid duplicating audio-control logic across multiple components
   - Keep rendering concerns separate from playback-state concerns

5. Keep the feature modest
   - No waveform scrubbing
   - No advanced transport controls
   - No playlists
   - No multiple simultaneous players

Secondary goals:

6. Improve the recording detail view so it feels complete enough for MVP testing
   - Show full note text clearly
   - Show metadata like duration and created time
   - Make the detail screen readable and clean
   - Ensure playback controls feel integrated into the screen

7. Make the recordings list aware of playback in a lightweight way
   - If useful, show a subtle indicator that a recording is currently playing
   - But do not overcomplicate the list view

Stretch goals (implement only if the core playback behavior is already solid):

8. Add support for resuming playback from the paused position rather than always restarting from the beginning

9. Add lightweight playback progress UI in the recording detail view
   - Show elapsed time and/or a simple progress bar
   - Keep it minimal and not DAW-like

10. Make the playback logic reusable enough that it could later support playback from recording cards or project views without major rewriting

Deliverable:
A working playback experience in the recording detail view that feels reliable, predictable, and simple, with optional lightweight progress/resume behavior if the core implementation is already stable.