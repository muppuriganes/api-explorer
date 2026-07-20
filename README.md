# >_ API Explorer

A fast, searchable, filterable directory for the
[public-apis/public-apis](https://github.com/public-apis/public-apis) collection of 1,400+
free APIs — styled like a modern developer terminal. Pure frontend: no backend, no build-time
data; the README is fetched live from GitHub and parsed in the browser.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks (tsc --noEmit) then bundles to dist/
```

## Stack

Vite · React 18 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · lucide-react

## Architecture

Data pipeline (all client-side):

```
raw.githubusercontent.com/public-apis/public-apis/master/README.md
        │ fetch (raw.githubusercontent.com sends CORS *)
        ▼
src/lib/parser.ts     — markdown → ApiEntry[]  (only content after "## Index";
        │               malformed rows are skipped, never crash)
        ▼
src/lib/cache.ts      — localStorage cache, 24h TTL
        │
        ▼
src/hooks/useApis.ts  — loading / ready / stale / error states, refresh()
        │
        ▼
src/App.tsx           — memoized filter chain:
                        auth/cors/https/favorites → fuzzy search → category → sort
```

- **Search** — `src/lib/fuzzy.ts`, a dependency-free scorer (substring > word-prefix >
  subsequence), debounced 200ms, weighted name > category > description.
- **Offline behavior** — fetch failure falls back to any cached copy (even expired) with a
  "cached data" notice; no cache at all shows an error state with retry.
- **Performance** — every pipeline stage is `useMemo`'d; results render incrementally
  (60 at a time via IntersectionObserver); only the first 24 cards animate per filter change;
  cards use `content-visibility: auto`.
- **Theming** — dark (default) and light themes via CSS variables switched on
  `<html data-theme>`; an inline script in `index.html` applies the stored theme before paint.
- **Keyboard** — `/` focuses the terminal search, `Esc` clears it.
- **Motion** — three signature animations (terminal boot typewriter, card cascade, badge
  LED power-on), all transform/opacity only, all disabled under `prefers-reduced-motion`.

## localStorage keys

| Key                        | Contents                          |
| -------------------------- | --------------------------------- |
| `api-explorer:data:v1`     | Parsed entries + timestamp (24h TTL) |
| `api-explorer:favorites:v1`| Array of favorited entry ids      |
| `api-explorer:theme`       | `dark` \| `light`                 |
