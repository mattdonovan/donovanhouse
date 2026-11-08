# Kristin Donovan Portfolio — Plan

> Historical plan. `DESIGN.md` is the source of truth for brand and interaction; where they differ, `DESIGN.md` wins.

Prototype: `site/` (Vite + React + React Three Fiber). Run with `cd site && npm run dev`.

## 1. Site map (from her wireframe)

| Route | Content | Status |
|---|---|---|
| `#/` | "portfolio / Kristin Donovan" wordmark, About me · Work · Connect buttons | Built |
| `#/about` | Hello + bio + portrait, "Why residential?", Education + credentials, quotes, CTA to work | Built; "Why residential" and quotes are placeholders |
| `#/work` | "work / Check it out" intro, then shelf of floating magazines | Built |
| `#/work/<id>` | Magazine reader (deep-linkable) | Built |
| Connect | Orange button everywhere → `mailto:donovanhouse@outlook.com`; footer block | Built (mailto only) |

Brand: navy `#1F2B3B`, orange `#F2540B`. Headings and hero wordmarks in PP Object Sans Heavy; script accent in Amsterdam Signature Three; body in Montserrat. Hero wordmarks are live text matching her Canva art (no image files).

## 2. Magazine interaction

1. **Shelf** — each project is a 3D magazine with a generated cover (masthead "DONOVAN HOUSE", project no., term, title, cover image). Magazines sit flat at rest (no tilt) with a very gentle float; they tilt only on hover.
2. **Hover / keyboard focus** — magazine tilts slightly, lifts, opens and flips through up to 3 spreads, then stops on an "Open project" spread. Mouse leave closes it.
3. **Click** — full-screen reader opens; cover opens automatically.
4. **Reader controls** — click right page = next, left page = back; ← → keys; swipe on touch; arrow buttons; thumbnail strip to jump (pages riffle to the target); Esc closes.
5. **Design reasoning** — caption panel beside each spread (her wireframe asks for "explanation of what the project was and my reasoning for each design choice").
6. **Detail** — "View full size" lightbox (fine text and drawings compress in the gutter), plus "Original PDF".
7. **Reduced motion** — floating and riffling turn off under `prefers-reduced-motion`.
8. **Reader viewing tools (desktop)** — Magnify lens (M; scroll changes power, shows true magnification), Flatten (F), zoom with ⌘/Ctrl + scroll, trackpad pinch (Chrome + Safari) or +/−, drag or scroll to pan, 0 resets. Gutter curve is softened to 45% by default and drops further when zoomed. Holding on a page presses it flat around the pointer with a spring (also on the shelf).
9. **Shelf** — vertical list: title, course, summary and tags on the left; magazine on the right, flat at rest. Hover tilts it, flips through up to 3 spreads, then stops on an "Open project" spread. The first row peeks above the fold.

Page mapping: each 16:9 slide becomes one open spread (left half on one page, right half on the next). Her presentations are already 16:9, so a PDF converts to a magazine with no re-layout.

## 3. Content pipeline (per project)

1. Export the presentation to 16:9 images: `spread-01.jpg …` at ~2048px wide and `spread-01-sm.jpg …` at ~1024px (shelf).
2. Put them in `site/public/projects/<id>/`.
3. Add an entry in `site/src/data/projects.js`: title, course, term, cover crop, captions.

Current state of her 9 projects:

| Project | Status |
|---|---|
| Lowe's Primary Bath (ITMD 235, Spring 2026) | All 12 slides as spreads |
| Coastal Style Concept Board (Fall 2024) | 1 spread (from the slide screenshot) |
| CAD Kitchen (DRAF 264, Spring 2024) | 2 spreads |
| NKBA Standards, Design Flex/2020, Chief Architect ×2, Environmental Systems, Policies & Procedures | "Coming soon" covers — the Canva embeds in the folder exported as blank grey boxes |

## 4. What Kristin needs to supply

- Captions: every caption marked `DRAFT` was written from the slides; she should rewrite them in her voice (the Color Palette caption is her own text).
- PDFs/images for the six placeholder projects. The two "Chief Architect – Interior Design Software I" slides look like one project; confirm.
- "Why residential?" paragraph and 2–3 quotes.
- Decide whether the phone number on her Lowe's thank-you slide should be public (it's inside the PDF and slide 12 image as-is).

## 5. Next steps

1. Review prototype with Kristin; tune cover design, magazine size, riffle speed.
2. Mobile pass: the open spread is 16:9, so on a portrait phone it renders small. Options: single-page mode on narrow screens, or rotate-to-landscape prompt. Not yet tested on a real device.
3. Performance: the reader loads 12 × 2048px textures (~2 s on localhost). Convert to KTX2/WebP and load spreads progressively.
4. Shared-element transition from shelf magazine to reader (currently a fade).
5. Optional page-turn sound (as in the tutorial), off by default.
6. Hosting: static build (`npm run build` → `dist/`) on Netlify/Vercel/GitHub Pages, pointed at donovanhouse.com. Add a contact form only if she wants one beyond mailto.

Credit: the page-turn mechanics in `site/src/components/Book.jsx` follow Wawa Sensei's 3D Book Slider tutorial.
