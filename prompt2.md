Extend the existing app by making core interactions functional and consistent. Preserve the architecture and domain model from Prompt 1.

Important constraints:
- Do not redesign the overall architecture
- Do not introduce backend-specific coupling
- Keep storage abstract (still mock or placeholder if needed)
- Keep UI simple and mobile-first
- Focus on making existing interactions real and consistent

Goals:

1. Fix recording screen interaction issues:
   - The pause button must be the only control for pausing
   - Tapping the pause button must actually pause recording
   - Remove any duplicate or misleading UI like “tap to pause” text if it is redundant
   - Ensure all controls (record, pause, resume, finish) are wired correctly
   - No UI element should appear interactive but do nothing

2. Clean up recording control UX:
   - Ensure clear and consistent state transitions:
     - ready → recording → paused → recording → finished
   - Ensure button labels/icons reflect the current state correctly
   - Avoid duplicate tap targets for the same action

3. Make recording cards interactive:
   - Tapping a recording card should navigate to a recording detail view
   - Create a simple recording detail screen if needed
   - In the detail view:
     - allow playback of the recording
     - display full note text
     - display metadata (duration, created time)
   - Do not implement editing yet, just viewing and playback

4. Make “assign to project” minimally functional:
   - Allow selecting an existing project from a list
   - Attach the recording to that project in app state
   - It does not need full persistence yet, but it must behave correctly in the UI

5. Make tags minimally functional:
   - Allow adding simple text tags to a recording
   - Allow selecting from existing tags if present
   - Tags should appear on the recording card
   - Keep tag system simple (no advanced filtering yet)

6. Handle mock vs real data clearly:
   - Keep mock data only where necessary for empty states
   - Clearly separate mock data from user-created data
   - Ensure newly created recordings appear correctly in lists

7. Improve interaction consistency:
   - Any visible button or tap target must have a working effect
   - Remove placeholder interactions that do nothing
   - Avoid confusing or duplicate interaction patterns

8. Keep code quality high:
   - Keep components reasonably small
   - Keep interaction logic readable
   - Avoid mixing unrelated concerns

Deliverable:
A version of the app where the main interactions (recording controls, recording cards, project assignment, and tags) are functional and consistent, even if still backed by simple or mock persistence.