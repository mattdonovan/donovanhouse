# Donovan House — Design Guide

This is the rulebook for how Kristin's portfolio looks, moves and reads. Claude reads it before any visual change so the site stays on-brand. Kristin, you never need to edit this file yourself. If you decide something new ("I want the titles bigger everywhere"), ask Claude to add it to the Decisions log at the bottom.

This file is the source of truth. `PLAN.md` is the older plan; where they differ, this file wins.

Related docs: `README.md` (setup), `CLAUDE.md` (how Claude works with Kristin), `.claude/skills/design-review/SKILL.md` (taste check), `.claude/skills/magazine-3d/SKILL.md` (3D magazine changes), `.claude/skills/add-project/SKILL.md`, `.claude/skills/publish/SKILL.md`, `.claude/skills/getting-started/SKILL.md`.

## 1. Brand story and voice

- **Who:** Kristin Donovan, residential interior designer. Interior Design at Johnson County Community College (graduating Fall 2026); BS in Home Furnishings Merchandising from the University of North Texas. The studio name is **Donovan House**.
- **Audience:** hiring managers, design firms, builders and future clients. They skim, then open one or two projects.
- **The idea:** each school project is bound like a magazine. You flip through it the way you'd flip through a design magazine on a coffee table.
- **Feel:** warm, confident, tidy. Editorial, not techy. The work is the hero; the site is the frame.
- **Voice:** first person ("I designed…"), plain and friendly, specific about decisions. No buzzwords.
- **Words we use:** "projects" (never "issues"), "spread" (one open two-page view), "Open project", "Connect".

## 2. Color

Tokens live at the top of `site/src/styles.css` (`:root`).

| Token | Value | Use |
|---|---|---|
| `--navy` | `#1f2b3b` | Headings, wordmarks, primary buttons, text links, reader tools |
| `--orange` | `#f2540b` | Accent only: script lines, Connect button, focus ring, hover title, active thumbnail |
| `--paper` | `#f7f4ef` | Footer, header on hover, tag pills, reader notes panel, tool hover. Never the page background |
| `--stone` | `#e7e2da` | Hairline borders in the reader, thumbnail placeholder |
| `--mist` | `#c8d0da` | Spare cool neutral (currently unused) |
| `--ink` | `#222` | Body text |
| `--muted` | `#5d6470` | Secondary text: summaries, captions, eyebrow labels, footer small print |
| page background | `#fff` | Every page is white |

Rules:
- Orange is a spice. One or two orange things per screen, at most.
- Orange text on white is about 3.5:1 contrast. Use it only for large text (script lines, big titles on hover), never small body text.
- White text on the orange Connect buttons is the same 3.5:1 at 16px/600, below the WCAG AA target. Known tradeoff, not yet decided.
- The 3D covers draw their own colors in `site/src/components/covers.js` (`NAVY`, `ORANGE`, `PAPER`, plus `#5d6470` for `--muted` on the end card). **If a brand color changes, change it in both `styles.css` and `covers.js`.**

## 3. Type

| Role | Font | Where it's set | Notes |
|---|---|---|---|
| Display / headings / hero wordmarks | **PP Object Sans Heavy** (900) by Pangram Pangram | `--display` | Licensed. Tight tracking (-0.02 to -0.045em) |
| Accent script | **Amsterdam Signature Three** (MyFonts) | `--script` | Purchased webfont. Always orange. Letter-spacing must stay `normal` or the connected letters break |
| Body and UI | **Montserrat** (Google Fonts, loaded in `site/index.html`) | `--sans` | 400–700. Buttons 600 |

Licenses:
- The font files in `site/src/assets/fonts/` are licensed to this site only. Never copy them into another project, email them or upload them elsewhere. (They are committed to this public repo; Matt is checking the license terms.)
- The MyFonts license comment at the very top of `styles.css` must stay.

Sizes in use (all fluid with `clamp`):
- Hero wordmark: `clamp(4.25rem, 15.5vw, 13rem)`, line-height 0.8.
- About "Hello,": `clamp(3.5rem, 9vw, 7rem)`. Section titles ("Education"): `clamp(3rem, 8vw, 6rem)`.
- Project title on the list: `clamp(2rem, 4vw, 3.3rem)`.
- Script headings ("Why residential?", "Let's connect"): `clamp(2.6rem, 6vw, 4.2rem)`.
- Body: 1rem, line-height 1.7–1.75. Eyebrow labels: 0.75rem, uppercase, 0.14em tracking.

### Wordmark rules

The hero wordmarks recreate Kristin's Canva art in live text:
- **Landing:** "portfolio" in navy PP Object Sans, with "Kristin Donovan" in orange script tucked under the right end.
- **Work:** "work" in navy, with "Check it out" in orange script under it, starting partway in.
- Both wordmarks use the **same size** (`.wordmark-type`). Don't size one up to fill its section.
- The script is half the word size (`0.5em`) and positioned in em, so it scales with the word. If you change the script size, its offsets move too; re-check the overlap.

## 4. Pages

All routes are hash routes: `#/`, `#/about`, `#/work`, `#/work/<project-id>`.

- **Landing (`#/`):** white, centered. Wordmark, then three buttons: About me (navy), Work (navy), Connect (orange, opens email). No header or footer.
- **Header (all other pages):** "Kristin Donovan" in script at left; About me, Work, Connect at right. Current page gets an orange underline. It hides when you scroll down and comes back when you scroll up or move the mouse to the top. Turns paper-beige on hover.
- **About (`#/about`):** "Hello, I'm Kristin Donovan" + bio + portrait; "Why residential?" (placeholder); Education with credentials and two campus photos; "Kind words" quotes (placeholders); "See the work" button.
- **Work (`#/work`):** "work / Check it out" wordmark and a one-line intro, then the project list. The hero is shorter than the screen so the first magazine peeks up from the bottom.
- **Project list:** one row per project. Left: number/term label, big title, course, summary, tags, "Open project" button. Right: a large magazine. On narrow screens (under 860px) the magazine moves above the text.
- **Reader (`#/work/<id>`):** full-screen. Top bar with title and close (×). Big magazine in the middle, notes panel on the right (340px, paper background) with the spread label, caption, "View full size", "Original PDF" and the shortcut list. Thumbnail strip along the bottom. Under 960px the notes move below the magazine.
- **Footer:** paper background, "Let's connect" script, orange email button, small copyright.

## 5. The magazine

Each 16:9 slide from Kristin's presentation becomes one open spread: left half on the left page, right half on the right page. Covers are drawn by code (`covers.js`): "DONOVAN HOUSE" masthead, project number and term, a cropped image, the title, her name in script, and the course. The back cover is navy with "portfolio" and her email.

### States

| State | What it does |
|---|---|
| **Rest (list)** | Closed, flat, facing straight on. Looks like a normal portfolio image. A very gentle float. Soft shadow underneath |
| **Hover / keyboard focus on the row** | Tilts slightly and lifts. Opens and flips through up to 3 spreads, one every ~0.85s, then stops on an "Open project" spread (navy right page, orange arrow). Title turns orange, button arrow nudges right |
| **Leave** | Flips quickly back to the cover |
| **Press and hold** | The page presses flat under the pointer with a springy rebound. A long hold doesn't open the project |
| **Click** | Opens the reader. Cover opens to spread 1 after a short beat |

### Reader tools

| Action | How |
|---|---|
| Turn page | Click right page (forward) or left page (back), arrow buttons, ← →, swipe, or click a thumbnail (pages riffle to it) |
| Magnify | **M** or the Magnify button. A round loupe; scroll changes its power; badge shows true magnification |
| Flatten | **F** or the Flatten button. Removes the gutter curve |
| Zoom | ⌘/Ctrl + scroll, trackpad pinch, **+ / −** keys or buttons, **0** resets. Up to 6× |
| Pan | Drag or scroll while zoomed |
| Full size / PDF | Buttons in the notes panel |
| Back out | **Esc** closes the lightbox, then the loupe, then resets zoom, then closes the reader |

The gutter curve is softened to 45% by default and 20% when zoomed, so text stays readable.

## 6. Motion

- Motion should feel like paper: quick turns that settle, small tilts, gentle float. Nothing spins or bounces for show.
- Legibility beats 3D flair. If an effect makes a spread harder to read, tone it down.
- Pages show true color: they light themselves and the scene adds only a little light, with no tone mapping. Don't brighten lights; white paper will blow out.
- Shadows stay subtle (about 13% opacity).
- **Reduced motion** (a computer setting some visitors turn on): floating stops, flip-throughs jump almost instantly, the reader fade-in and button lifts are turned off. Every new animation must respect this too.

## 7. Accessibility

- Every interactive thing works with a keyboard and shows the orange focus ring.
- Focusing a project's "Open project" button triggers the same flip-through as hover.
- Images need real `alt` text. Magazine covers need a text label.
- Keep body text dark enough: `--ink` or `--muted` on white or paper. Not orange.
- Click targets at least about 40px.
- Desktop-first. Mobile hasn't had its review pass yet; don't break it, but don't polish for it until that pass happens.

## 8. Images and content

### Exporting a project

1. Keep the presentation 16:9. Each slide becomes one spread.
2. Avoid putting key text right at the center line of a slide; that's the magazine fold.
3. Export the whole deck as a PDF.
4. Claude converts it on a Mac with `swift scripts/pdf-to-spreads.swift "file.pdf" public/projects/<id>` (run in `site/`). That makes `spread-NN.jpg` (2048px wide) and `spread-NN-sm.jpg` (1024px, for the list).
5. Pick a cover image area (the `cover.crop` in `site/src/data/projects.js`).
6. Remove any private details (phone numbers, client last names) before publishing. The repo is public.

### Captions (the notes beside each spread)

- One caption per spread: a short heading plus 2–4 sentences.
- First person, in Kristin's words. Explain **why**: the client need, the choice, the reason. "I chose honed marble because…"
- Name real products and standards where they matter (NKBA guideline, Sherwin-Williams color).
- Captions marked `DRAFT` were written by Claude from the slides. They're placeholders until Kristin rewrites them.

### Project summary on the list

One or two sentences, max about 40 words. Lead with what the space is and its feeling.

## 9. Decisions log

Newest at the bottom. Add a line when a design decision is made.

| Decision | Why |
|---|---|
| Navy `#1f2b3b` + orange `#f2540b` brand | From Kristin's existing Donovan House brand and Canva art |
| White page background; paper `#f7f4ef` only for the footer, header hover and small panels | Keeps the work bright and the site gallery-like; beige everywhere felt heavy |
| PP Object Sans Heavy for headings and wordmarks | Closest match to her Canva wordmarks; licensed |
| Amsterdam Signature Three for script accents | Her brand script; purchased MyFonts webfont |
| Montserrat for body | Clean, free, pairs with the heavy display face |
| Hero wordmarks are live text, not images, and share one size | Sharp at any size, editable, consistent between pages |
| Call them "projects", never "issues" | Clearer for employers; "issues" sounded like problems |
| Project list is vertical rows: text left, big magazine right | Reads like a normal portfolio; the magazine is a bonus, not a puzzle |
| Magazines flat at rest, no tilt | Looks like a portfolio image until you interact; less gimmicky |
| Hover tilts slightly and flips up to 3 spreads, then stops on "Open project" | Previews the work and tells people what to do next |
| First project peeks above the fold | Signals there's more below the hero |
| Header hides on scroll down, returns on scroll up | More room for the work |
| Pages self-lit, no tone mapping | Her colors and material boards must show true color |
| Reader gutter curve softened to 0.45 | Text near the fold was hard to read at full curve |
| Legibility over 3D flair | It's a portfolio first |
| One 16:9 slide = one open spread | Her decks are already 16:9; no re-layout needed |
| Respect reduced motion | Some visitors get motion-sick |
| Desktop-first; mobile pass still to do | Hiring reviewers mostly use laptops; a phone layout needs its own decisions |
| Licensed fonts stay inside this site | License terms |

### Still open

- Six projects waiting on exported files: NKBA Standards, Design Flex/2020, Chief Architect (×2, maybe one project), Environmental Systems, Policies & Procedures.
- `DRAFT` captions need Kristin's words.
- About page: "Why residential?" paragraph and 2–3 quotes.
- Password protection: undecided.
- Mobile review pass.
