# Donovan House — Kristin Donovan Interior Design Portfolio

Portfolio site for Kristin Donovan. Each project is presented as a 3D magazine you can flip through (React Three Fiber; page-turn approach adapted from Wawa Sensei's 3D Book Slider tutorial).

## Run it

```bash
cd site
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in site/dist
```

## Layout

- `site/` — the Vite + React app
  - `src/data/projects.js` — project list, captions, tags (add projects here)
  - `src/components/Book.jsx` — skinned-mesh page turning, curve/flatten, press physics
  - `src/components/Reader.jsx` — full-screen reader: magnify (M), flatten (F), zoom/pan
  - `src/components/Shelf.jsx` — project list with hover flip-through
  - `public/projects/<id>/` — spread images (`spread-NN.jpg` ~2048px, `spread-NN-sm.jpg` ~1024px)
- `Website wireframe_2026_Donovan Portfolio/` — Kristin's original wireframe and design references
- `PLAN.md` — site plan, content checklist, next steps

## Adding a project

Export the presentation as 16:9 slide images into `site/public/projects/<id>/`, then add an entry to `site/src/data/projects.js`. Each slide becomes one open spread.
