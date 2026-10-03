# UI Rules

Rules for building the web app (`frontend/`) with MUI (Material UI). These keep the UI consistent
across sessions. Read this before any UI task. Items marked _(proposed)_ are defaults not yet
confirmed.

## Versions

- `@mui/material` major version: **v9**. Keep `@mui/icons-material` on the matching major.
- Record the installed major version above and write code for **that** version only. MUI APIs
  change between majors (e.g. `Grid` props); do not rely on memory of older versions.

## Looking things up (MUI MCP)

The project has the official MUI MCP server (`mui-mcp` in `.mcp.json`).

- Before using a component, prop or theme API you are not certain about, call `useMuiDocs` for
  the relevant package, then `fetchDocs` for any linked pages you need.
- Base answers and code on the fetched docs, not memory. If the docs and memory disagree, the docs
  win.
- If the MCP is unavailable, say so and check the installed package's TypeScript types instead.
- `npm run typecheck` must pass: wrong props are caught here.

## Theme

- One theme, defined in `frontend/src/theme.ts` and applied once at the root with
  `ThemeProvider` + `CssBaseline`.
- **No hard-coded colours, font sizes or pixel spacing in components.** Use theme values:
  - Colours: palette keys (`primary.main`, `text.secondary`, `success.main`, `error.main`, …).
  - Spacing: theme spacing units (`p: 2`, `gap: 1`), not `px`.
  - Typography: `Typography` variants (`h6`, `body2`, …), not custom font sizes.
- A new colour or size needed in several places → add it to the theme, not to a component.
- Light/dark mode: follow the system setting.

## Styling

- Use the `sx` prop for one-off styles.
- Anything repeated across components → theme `components.<MuiName>.defaultProps` /
  `styleOverrides`, not copy-pasted `sx`.
- `styled()` only for a reusable styled component used in several places.
- No CSS files, CSS modules, inline `style={}` or other styling libraries.

## Components

- Use MUI components before writing custom ones. No other component libraries.
- Layout: `Container`, `Stack` and `Box` for most layout; `Grid` only for real 2D grids.
- Tables: MUI `Table` components by default. Move to `@mui/x-data-grid` only when sorting,
  filtering or pagination is genuinely needed.
- Icons: `@mui/icons-material`, imported by path to keep the dev server fast:
  `import RefreshIcon from '@mui/icons-material/Refresh';`
- Components: named imports from `@mui/material`:
  `import { Button, Stack } from '@mui/material';`
- Keep page components presentational: API calls live in `frontend/src/api/` (a fetch + schema
  module and a hook per resource), not inside UI components.

## Forms

- MUI inputs (`TextField`, `Select`, `Checkbox`, …) with a visible label each.
- Validate on the client for fast feedback, with the same rules the API enforces; the API stays
  the authority and its `400` messages are shown next to the fields they name.
- Disable the submit button while a request is in flight; show success or failure afterwards
  (`Snackbar` or inline `Alert`).
- Destructive actions ask for confirmation (`Dialog`) and say what will be lost.

## Layout and navigation

- App shell: `AppBar` with the app title and navigation between the screens.
- TODO(setup): Navigation style. `Tabs` for a few screens, a router once screens need their own
  URLs.
- TODO(setup): Screens, each with how to reach it (URL path or tab label), e.g. "Home (`/`, the
  default)". The issue agent screenshots screens by this list.
- Must work well on both desktop and phone (the agent screenshots both: 1280×900 and 390×844).

## Data display

- TODO(setup): Domain display rules, e.g. money format and currency, date and time format and time
  zone, units, status colours and chip variants.
- Numeric table columns are right-aligned and use tabular figures
  (`fontVariantNumeric: 'tabular-nums'`) so digits line up.
- Meaning never relies on colour alone: pair colour with a label, sign or icon.
- Show structured data (objects, details) as readable key/value lists, not raw JSON.

## States

Every data view handles all four states:

- **Loading:** `Skeleton` matching the final layout (or `CircularProgress` for small areas).
- **Error:** `Alert severity="error"` with a short message. No raw payloads, stack traces or
  secrets.
- **Empty:** a short explanation of why it is empty and, if there is one, the next step.
- **Data:** the normal view.

The API modules' tests cover what leads to each state (a bad response → error, no rows → empty).

## Accessibility

- Use semantic MUI components (`Button`, `Link`, `Table`) rather than clickable `Box`es.
- Icon-only buttons have an `aria-label`.
- Keep MUI's default focus styles; don't remove outlines.
- Text meets contrast in both light and dark mode (use palette `text.*` colours).
