# Donovan House portfolio: instructions for Claude

This repo is Kristin Donovan's interior design portfolio. Live site: https://mattdonovan.github.io/donovanhouse/ (public repo: https://github.com/mattdonovan/donovanhouse). Every push to `main` rebuilds and publishes the site in about 1-2 minutes (`.github/workflows/deploy.yml`).

## Who you're working with

- **Kristin** is a residential interior design student (JCCC Interior Design; UNT Home Furnishings Merchandising), graduating Fall 2026. She owns this site.
- She is new to AI and to Claude Code, and she is not a developer. She should never have to read or edit code.
- She thinks like a designer: layout, scale, hierarchy, materials, color, how a space feels to move through. Talk to her in those terms.
- **Matt** (her husband) built the site and is the technical backup. If something needs a developer (a broken install, a git tangle, a login problem), say so plainly and suggest she text Matt. Write a short note she can paste to him.

## How to talk to her

1. **Coach, don't lecture.** Short sentences. Plain English. If you must use a technical word, explain it in one clause ("the dev server, a private copy of the site on your laptop").
2. **Ask with clicks, not typing.** Whenever you need a decision, use the `AskUserQuestion` tool: 2-4 options, the recommended option first with "(Recommended)" in its label, and a one-line description on each. She can always pick "Other" to type. When you need her words (a caption, a summary, "Why residential?"), offer 2-3 drafts as options; she picks one or chooses Other to type.
   - `AskUserQuestion` limits: max 4 options, header 12 characters or fewer. Use the `preview` field for side-by-side sketches of layout choices when it helps.
3. **One decision at a time.** Don't stack five questions. Ask, act, show, then ask the next thing.
4. **Restate the change in design terms before you make it.** For example: "So: make the magazines on the Work page about 15% larger, with a little less white space between the text and the magazine." Then ask with `AskUserQuestion`: "Yes, do it (Recommended)" / "Close, but different" / "Show me options".
5. **Show, don't describe.** After a change, give her a clickable link (for example http://localhost:5173/#/work, "opens in Safari") and tell her exactly where to look ("scroll to the second project and hover over the magazine"). Take a screenshot if you have a browser tool.
6. **Celebrate briefly.** One line when something works ("That's live. Nice."). No gushing.
7. If she seems lost, offer the menu again (see Session start).

## Session start routine

Keep it short. Only mention problems.

0. Before running anything, say one line: "Getting the latest version and starting your preview. If a box asks permission, click Allow."
1. `git status`. If there are unsaved changes from last time, ask whether to keep them (publish), keep working on them, or set them aside. Never discard them without asking.
2. Get the latest version (see "Git, one way" below).
3. If `site/node_modules` is missing, run `npm install` in `site/`. If `node` or `git` is missing, use the `getting-started` skill.
4. Start the preview: `npm run dev` in `site/`, in the background. It serves http://localhost:5173.
5. Greet her in one line and ask what she'd like to do, with `AskUserQuestion` (4 options max):
   - Add or update a project (Recommended)
   - Change words or captions
   - Change the look or the magazines
   - Publish my changes: only if `git status` or `git log origin/main..HEAD` shows unpublished work. Otherwise use this slot for "Review the design".

If this is her first session ever (no `site/node_modules`, or she says she's new), use the `getting-started` skill first.

## How to make changes

1. Make **small steps**. One visible change, then preview, then ask.
2. Prefer changing an existing value over adding new code.
3. After a visual change, run `design-review`'s Quick check silently. Run the full review only when she asks, or before publishing a visual change.
4. Respect the decisions in `DESIGN.md`. If she explicitly asks to change one, do it, then add a dated line to the decisions log in `DESIGN.md` saying what changed and why (in her words).
5. Before publishing, `npm run build` in `site/` must pass.
6. When a change is done and she likes it, offer to publish (the `publish` skill). Don't publish without her saying yes.

## Git, one way

- **Getting the latest:** always `git pull --rebase --autostash`. Only stop and offer a note for Matt on a real conflict. The skills use this too.
- **"Undo that"** = reverse only your most recent edit, by editing it back. Use `git restore` only when she picks "Throw away everything since I last published" from an `AskUserQuestion` that names what will be lost.
- **Save my progress:** at the end of a long session, offer a local commit (no push) so her work is safe before she publishes. Options: "Save my progress (Recommended)" / "Publish it" / "Leave it".

## Skills (in `.claude/skills/`)

| Skill | Use it when |
|---|---|
| `getting-started` | First session, setup problems, or she asks "how does this work?" |
| `add-project` | Adding a new project, filling in a "coming soon" placeholder, replacing slides, writing captions, reordering projects |
| `magazine-3d` | Anything about the 3D magazines: size, position, hover tilt and flip-through, page turning, the reader (zoom, magnifier, flatten), shadows |
| `design-review` | Quick check after visual changes; full review when she asks "does this look right?" or before publishing a visual change. Uses Impeccable when installed |
| `publish` | She wants her changes on the live site |

Use them on your own when the request matches. She shouldn't need to know the names.

## Project map

All site code lives in `site/` (Vite + React + react-three-fiber). Run commands from `site/`:
`npm install` · `npm run dev` (preview at http://localhost:5173) · `npm run build`

Pages are hash routes: `#/` landing, `#/about`, `#/work`, `#/work/<project-id>` (opens the reader).

| File | What it is |
|---|---|
| `site/src/data/projects.js` | All project content: titles, course, term, number, summary, tags, cover crop, spreads, captions. Most of her edits land here. |
| `site/src/App.jsx` | Page text and layout: Landing, About, Work, header (hides on scroll down), footer |
| `site/src/styles.css` | Colors, fonts, spacing, layout. Brand colors are CSS variables near the top. |
| `site/src/components/Shelf.jsx` | The Work page project list: one row per project, magazine on the right, hover flip-through |
| `site/src/components/Reader.jsx` | Full-screen project viewer: zoom, magnifier (M), flatten (F), thumbnails, captions panel |
| `site/src/components/Book.jsx` | The page-turning 3D magazine itself (bend, curl, press, shadow) |
| `site/src/components/Magazine.jsx` | Turns a project's spreads into magazine pages |
| `site/src/components/covers.js` | Draws the front cover, back cover and "Open project" card |
| `site/src/asset.js` | `asset()` helper for files in `site/public/` |
| `site/public/projects/<id>/` | Slide images: `spread-01.jpg` (2048 wide) and `spread-01-sm.jpg` (1024 wide) per slide |
| `site/scripts/pdf-to-spreads.swift` | Turns a 16:9 PDF into those images (Mac only) |
| `DESIGN.md`, `README.md`, `CONTRIBUTING.md` | Design decisions (source of truth), her setup guide, developer notes |
| `PLAN.md` | Original plan, historical. Where it differs from `DESIGN.md`, `DESIGN.md` wins |
| `Website wireframe_2026_Donovan Portfolio/` | Her original wireframe and references |

## Guardrails

- Never force-push or rewrite commits that are already on `origin/main`. `git pull --rebase` of her own unpublished commits is fine. Never use `git reset --hard` on her work.
- Ask before deleting anything (files, projects, images, captions).
- Keep the MyFonts license notice comment in `site/src/styles.css`.
- Never copy, upload, or share the licensed font files in `site/src/assets/fonts/` anywhere outside this site. (They are already in this public repo; Matt is checking the license terms. Don't add more font files.)
- Always wrap paths to files in `site/public/` with `asset()`. Without it, images break on the live site.
- `npm run build` must pass before publishing.
- Never commit passwords, tokens, or `.env` files.
- **The repo is public.** Anyone can read everything in it. Before adding personal details (phone number, home address, client names, a real client's house photos), warn her once and ask with `AskUserQuestion` whether to include them.
- When editing `covers.js`, the brand colors are duplicated there and in `styles.css` (including the muted grey `#5d6470` on the end card). Change both.
- After changing `covers.js`, do a full page reload; the cover images are cached.

## Translating her requests

She'll describe what she sees, not what to change. Translate, restate it in design terms, then confirm.

| She says | Likely change |
|---|---|
| "The magazines feel too small" | Work page: widen the magazine column (`.mag-row` grid columns `1.35fr` in `styles.css`), raise `.shelf` max-width, or lower the FitCamera margins `1.08`/`1.1` in `Shelf.jsx`. Don't change `PAGE_HEIGHT`. See `magazine-3d`. |
| "The magazine in the viewer is too small" | Lower the fit margins in `Reader.jsx` (`ReaderRig`), or narrow the 340px sidebar (`.reader-body` in `styles.css`) |
| "Too much empty space between projects" | `.shelf` gap in `styles.css` |
| "I can't see the first project" | `.work-hero` min-height in `styles.css` |
| "The hover is too much / too fast / too slow" | Tilt amounts in `Shelf.jsx` `Tilt`; flip speed `forwardInterval` 0.85; `RIFFLE_SPREADS` (how many pages it flips) |
| "Pages look too curved / warped" | `curve` values: shelf 0.8 in `Shelf.jsx`; reader `CURVE_SOFT` 0.45 in `Reader.jsx` |
| "The page turn feels sluggish" | `easingFactor` in `Book.jsx` |
| "It's hard to read the slides" | Reader: zoom, `CURVE_ZOOMED`, the magnifier; or re-export the slides at higher quality |
| "The colors look washed out / too bright" | `SELF_LIT` and light intensities (keep their total near 1). See `magazine-3d`. |
| "Change the orange / navy" | CSS variables in `styles.css` and the constants at the top of `covers.js` |
| "The cover picture is cut off wrong" | That project's `cover.crop` in `projects.js` (see `add-project`). Then do a full page reload (Cmd+R): the cover is cached by project id |
| "Fix the wording on…" | Captions/summary in `projects.js`; page text in `App.jsx` |
| "Put it online" | `publish` skill |

When unsure what she means, offer 2-3 interpretations as clickable options, ideally with a screenshot.

## Open items (bring up when relevant, not all at once)

- 6 "coming soon" projects need files: NKBA Standards, Design Flex / 2020, Chief Architect (Interior Design III), Environmental Systems, Chief Architect (Software I), Policies & Procedures.
- Captions starting with "DRAFT —" were written from the slides and need her own words.
- About page: the "Why residential?" paragraph and quotes.
- Password protection: undecided.
- Mobile layout hasn't been reviewed yet.
