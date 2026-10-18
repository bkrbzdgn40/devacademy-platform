# M8.6A · DevAcademy Olive & Earth Design System

## Product decision

New visual identity: **olive and earth**. Warm linen/cream surfaces for long
reading, deep cocoa for code excerpts, deep olive for primary actions, and
terracotta/cinnamon for editorial hierarchy, contextual emphasis and
secondary accents. No fluorescent purple, gratuitous gradients or stock
fonts. This is the base design-system release, not the complete M8.6B–E page
redesign.

### Canonical palette

| Semantic role | CSS token | Hex | Usage |
|---|---|---|---|
| Page canvas | \`--color-cream\` | \`#F8F5EF\` | Page background |
| Paper | \`--color-paper\` | \`#FFFDFA\` | Cards, reading surface |
| Warm neutral | \`--color-sand\` | \`#F1E9DE\` | Secondary cards/input surfaces |
| Main ink | \`--color-ink\` | \`#2F2A22\` | Text |
| Muted ink | \`--color-ink-muted\` | \`#665B4C\` | Subtitles |
| Olive primary | \`--color-olive-800\` | \`#485C32\` | CTA/button/links |
| Deep olive | \`--color-olive-950\` | \`#303C25\` | Hover |
| Light olive | \`--color-olive-100\` | \`#E5E9D6\` | Learning highlights |
| Terracotta | \`--color-terracotta-700\` | \`#AB583B\` | Editorial/alerts |
| Cinnamon | \`--color-cinnamon\` | \`#93512F\` | Eyebrow & focus |
| Camel | \`--color-camel\` | \`#D9C3A5\` | Warm accents |
| Cocoa | \`--color-code-bg\` | \`#251F1A\` | Source reading panels |

The contrast test enforces WCAG-style normal text contrast **≥ 4.5:1** for
core foreground/background token combinations including both sides of the
primary button, body and code. This alone is not a complete accessibility
audit; test rendered states and browser zoom too.

## New component contract

- Semantic aliases beginning with \`--ui-*\` in
  \`apps/web/src/app/design-tokens.css\` are the stable vocabulary for new
  styles. Named raw palette entries are only for selecting appropriate tone.
- Typography, spacing, radius, shadow and reduced motion values are tokenized.
  Headings use a local serif editorial stack; readable application/body type
  uses a local system sans stack; code uses monospaced fallback fonts.
- \`ui-primitives.tsx\` exports typed, server-renderable **ActionLink**,
  **SurfaceCard**, **SectionHeading** and **StatusPill**. Base CSS additionally
  styles buttons, inputs, selectable options, progress and focus states.
- Reuse \`ui-button\`, \`ui-card\`, \`ui-pill\` and semantic CSS variables in new
  components. Do not introduce a new unique hex into each component.
- The homepage, navigation brand, course cards and student dashboard now
  consume these conventions. Existing code, quiz, transfer and Learning Studio
  surfaces have explicitly adapted overrides without changing data or logic.

### Learning UI

Warm paper panels hold explanations, conceptual cards, step navigation and
forms. Cocoa code samples and the Studio source pane remain darker. CodeMirror
continues using a light, warm edit surface so its existing syntax-highlight
colors remain legible without bringing in a theme package. Users should not
confuse a read-only sample with an executable public editor.

### Accessibility and mobile

- Keyboard-visible cinnamon focus treatment on links/buttons/inputs/details.
- Minimum 44px touch height on primary actions and mobile nav.
- Mobile 320px+ stack layouts preserved and checked in actual headless Chrome.
- Reduced-motion preference suppresses decorative animation/transition.
- Core token contrast checks run under the Node test suite.
- Semantics use normal links, buttons, headings, forms and \`details\`, not
  fake clickable divs.

## Scope and release checklist

No external font downloads, npm dependency, production deployment,
database migration, student-state changes or public runner activation.

CI must pass lint, TypeScript, Node tests, production build and responsive
Chrome. Browser checks must assert tokens are loaded and detect horizontal
scroll on major screens. Only merge after checks pass.

Remaining M8.6 milestones: B is homepage/catalog structure and learning
recommendations; C is more substantial lesson workstation/navigation
reorganization; D is progress insights; E is final usability polish.
