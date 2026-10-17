# M2 CodeMirror 6 editor preview

The browser-based editor uses `@uiw/react-codemirror` with CodeMirror 6, JavaScript language support, syntax highlighting, line numbers, folding, autocompletion, keyboard editing and local reset. This is a **real source-code editor**, not a compiled or interpreted runner.

- `/laboratuvar`: dedicated scratch editor with a starter program.
- `/dersler/[slug]`: editable example for each published JavaScript lesson.
- **No execute API** is exposed and submitted code is never run by Next.js.
- Editing is ephemeral (not persisted to any account or external service).
- The disabled Run control communicates the pending isolation review.

Execution will be developed separately, with a remote sandbox that cannot access app/database credentials. Security gates in `docs/security/THREAT_MODEL.md` apply before any public execution.

Dependencies are fixed versions and resolved by the pinned pnpm lockfile. Static tests check page rendering and that no execution endpoint is exposed; visual keyboard/editor behavior still needs manual testing.
