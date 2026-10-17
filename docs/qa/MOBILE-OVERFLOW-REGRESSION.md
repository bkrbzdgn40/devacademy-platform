# Mobile horizontal overflow regression (M2)

The October 2026 private manual test reported whole-page horizontal scrolling on mobile.

## Root cause and targeted fix

The header contained six navigation links forced into a single row on narrow screens. The page's width exceeded the available mobile viewport. Long code snippets and min-content sizing were additional containment risks.

- At **600px and below**, present navigation in two rows of three equal-width cells, with legible labels and keyboard-focusable links.
- At intermediate widths, let navigation wrap naturally and omit the non-essential preview pill.
- Give grid and flex children `min-width:0` where needed, and keep long code horizontally scrollable **inside the code panel**.
- Do **not** set `body{overflow-x:hidden}`: it hides layout bugs rather than solving them.

## Automated check

`node apps/web/tests/responsive-smoke.mjs` starts the built production app and a headless Chrome browser. It inspects actual DOM `documentElement.scrollWidth` against the CSS viewport at **320, 375, 390, 600, 768, 960, 1024px** for six routes (42 cases); it also waits for CodeMirror to mount on lesson and lab pages. The standard CI workflow runs this after the existing production build.

This does not replace manual keyboard, touch and visual reviews; the user should repeat the mobile browser test after pulling main.

Run with Node 24, Chrome available on PATH (`CHROME_BIN` can override it), and an existing production build. No third-party browser automation dependency is required.
