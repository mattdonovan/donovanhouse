---
name: magazine-3d
description: Use when Kristin wants to change the 3D magazines on the Work page or in the project reader. Covers how big they are and where they sit, how the hover flip-through behaves, how a project opens, page turning, the cover and "Open project" designs, magnify, flatten, zoom, press-and-hold, and how the pages curl, float, tilt or cast shadows. Trigger words include magazine, book, cover, flip, page turn, hover, tilt, float, shadow, zoom, magnify, loupe, flatten, reader, "Open project", "bigger", "smaller", "smoother", "faster", "slower" and "feels weird".
---

# Changing the 3D magazines

Kristin is not a developer. She will describe what she sees and feels ("the magazines look small", "the flip is too slow", "it's hard to read"). Your job is to turn that into a small, safe code change, show her the result, and check that nothing else broke. Never ask her to edit code or pick a number on her own. Offer choices she can picture.

The knob table, with file:line, current values and safe ranges, is in `.claude/skills/magazine-3d/reference.md`. Read it before you change anything. Line numbers drift, so always find a knob by its name (for example `grep -n RIFFLE_SPREADS`) and don't trust the line number alone.

Related docs: `CLAUDE.md` (house rules), `DESIGN.md` (brand and design decisions), `.claude/skills/design-review/SKILL.md` (usability and taste check), `.claude/skills/publish/SKILL.md` (saving and putting changes live), `.claude/skills/add-project/SKILL.md` (new projects and captions).

## 1. Understand the request

1. Restate what she wants in one plain sentence. Keep it to one line.
2. If more than one change could match her words, ask with **AskUserQuestion**: 2-4 options, your recommended one first and marked "(Recommended)". Describe each option as what she'll **see**, not what code changes. The "Other" choice is added automatically for typing.
3. If the request would break a design decision in `DESIGN.md` (for example "make them spin" versus "legibility over 3D flair"), say so in one line and offer an option that keeps the decision.
4. **Try it and look.** She decides by seeing, not reading. Apply the recommended option, screenshot it (or point her to an exact spot: "open http://localhost:5173/#/work and hover the first magazine"), then ask: "Keep it (Recommended)" / "A bit more" / "A bit less" / "Try another way". Repeat until she keeps it. Use the `preview` field on options for side-by-side layout sketches when the choice is about arrangement.

### What she might say, and what it usually means

| She says | Likely change | Where |
|---|---|---|
| "Magazines are too small / bigger" | Wider magazine column, less empty margin around the magazine, or a wider page | `.mag-row` columns, `.shelf` max-width, FitCamera margins |
| "Too much space between projects" | Row gap | `.shelf` gap (styles.css) |
| "Magazine on the left / swap sides" | Grid column order | `.mag-row` in styles.css plus ShelfItem markup order |
| "First project should show more / less at the top" | Hero height | `.work-hero` min-height |
| "Flip-through is too slow / fast" | Seconds per page on hover | `forwardInterval` 0.85 (Shelf.jsx) |
| "Show more / fewer pages on hover" | Preview spread count | `RIFFLE_SPREADS` |
| "Don't flip on hover, just open it" | Hover target page | hover effect in ShelfItem (`setPage(hovered ? endSpread : 0)`) |
| "Hover tilt is too much / not enough" | Tilt and lift | `Tilt` in Shelf.jsx |
| "Stop the bobbing / floating" | Float strength | `<Float>` in Shelf.jsx or Reader.jsx |
| "Pages look too curved / warped" | Gutter curve | `curve` (shelf 0.8, reader CURVE_SOFT 0.45) |
| "Page turn feels sluggish / jerky" | Turn easing and duration | `easingFactor`, turn duration 400 ms |
| "Shadow is too dark / light / missing" | Blob shadow (shelf) or shadow catcher (reader) | BlobShadow opacity, reader shadow plane opacity |
| "Hard to read in the reader" | Bigger book, flatter pages, more zoom | reader fit margins, sidebar width, CURVE_SOFT, MAX_ZOOM |
| "Change the cover / back cover / Open project page" | Canvas drawing | `covers.js` |
| "Crop the cover photo differently" | Per-project crop | `cover.crop` in `site/src/data/projects.js` |
| "Pressing the page feels bouncy / weird" | Press spring | `PRESS_*` in Book.jsx |
| "Colors look washed out / too bright" | Lighting balance | `SELF_LIT` + scene lights (keep the total near 1) |

### Example: "make the magazines bigger"

Ask:

- **Bigger magazine, same layout (Recommended).** The magazine takes more of the row and the text column gets a bit narrower. Still one project per row.
- **Magazine fills its frame more.** Same layout, with less white space around the magazine. A small change.
- **Magazine on top, text underneath.** Each magazine spans the full width, like a big photo, and the text sits below it. You see fewer projects per screen.

## 2. How it fits together (for you, not for her)

- `site/src/data/projects.js`: all project content. The array order is the shelf order.
- `site/src/components/Book.jsx`: the shared page engine. Each page is a skinned mesh with 31 bones. It handles curl, turning, the press spring, blob shadow and `useDelayedPage` (which flips through pages one step at a time instead of jumping).
- `site/src/components/Magazine.jsx`: turns a project into sheets. Each 16:9 spread image is split into a left and a right page (8:9 each). It adds the cover, back cover and the optional "Open project" end card.
- `site/src/components/covers.js`: draws the cover, back cover and end card on a canvas. Colors are hard-coded hex values that copy the CSS variables.
- `site/src/components/Shelf.jsx`: the Work page list. It uses **one** fixed full-screen canvas with pointer events off, plus a drei `<View>` per row that tracks the DOM `.mag-stage`. Hover and click are plain DOM events (the row `<li>` and the `.mag-hit` button), not 3D raycasting.
- `site/src/components/Reader.jsx`: the full-screen viewer at `#/work/<id>`, with its own canvas. Pages are clickable in 3D. It has zoom and pan, the magnifier (M), flatten (F), hold-to-press, thumbnails, captions, a lightbox and the PDF link.
- `site/src/App.jsx`: routes. `#/work` shows the shelf; `#/work/<id>` adds the Reader on top and pauses the shelf canvas.
- `site/src/styles.css`: the layout of rows, stage size, bleed, reader columns and the reduced-motion rules.

## 3. Rules that must not break

1. **Bleed must match.** `BLEED_X`/`BLEED_Y` in Shelf.jsx must equal the `.mag-view` inset in styles.css (`inset: -80px -64px`, Y then X). The `.mag-row` column-gap must stay ≥ BLEED_X, and the mobile row-gap must stay ≥ BLEED_Y. If these drift apart, turning pages get clipped or draw over the text.
2. **Don't resize with `PAGE_HEIGHT`.** The cameras refit automatically. Change the size with CSS (columns, max-width, stage aspect) or with the FitCamera margins instead.
3. **Colors live in two places.** CSS vars (`--navy`, `--orange`, `--paper`) and the `covers.js` constants. Change both, or neither.
4. **True color.** Canvases are `flat` (no tone mapping). Pages are self-lit (`SELF_LIT` 0.75) plus ambient 0.4 plus directional 0.45. Keep self-lit plus lights near 1, or the white paper blows out.
5. **Keep `ClearDepth`** in each shelf View, and keep the hovered View index higher, so neighbouring magazines don't cut into each other.
6. **The hinge uses `easing.damp`, not `dampAngle`.** Switching it makes pages swing the wrong way.
7. **Bone-count constants travel together.** If you change `PAGE_SEGMENTS`, you must also update the BASE_CURVE thresholds, the fold bones, PRESS_SIGMA and the skinIndex clamp. Avoid this unless it is truly needed.
8. **Duplicated values:** `HOLD_MS` (Shelf.jsx and Reader.jsx); turn duration 400 (twice on one line in Book.jsx); `LOUPE_SIZE` and `.loupe` 280px; the reader keys in `onKey` and the `SHORTCUTS` legend; the email in covers.js and `contact.email` in projects.js; the name "Kristin Donovan" in covers.js (3 places).
9. **Covers are cached.** After you edit `covers.js`, do a full page reload. Hot reload may show the old cover. A new font weight must be added to `loadFonts` in covers.js.
10. **Asset paths** go through `asset()` from `site/src/asset.js`.
11. **Reduced motion** must keep working: Float off, near-instant flip-through, and the CSS `@media (prefers-reduced-motion)` rules.
12. **Brand decisions** in `DESIGN.md`: magazines sit flat (no tilt) at rest, they're called "projects" (never "issues"), the shadows are subtle, legibility beats 3D flair, and the licensed font files never leave `site/src/assets/fonts`.

## 4. Make the change

1. Change one thing at a time, and keep the diff small. Prefer moving an existing knob over adding new code.
2. Stay inside the safe range in `reference.md`. If she wants more than that range allows, tell her plainly and test it carefully.
3. If you add a new value, put it next to the related constant with a short comment.

## 5. Check it works

Run all of these from `site/`:

1. `npm run build`. It must finish with no errors.
2. Start the dev server (`npm run dev`, http://localhost:5173) and open it with a browser tool if you have one. If not, give her the link (opens in Safari) and use the screenshot coaching in `design-review` Step 2.
3. **Work page** (`#/work`):
   - The first magazine peeks above the fold.
   - Magazines sit flat at rest.
   - Hovering a row tilts the magazine, flips through up to 3 spreads, then stops on "Open project".
   - Moving the mouse away flips it back to the cover.
   - No page is cut off at the edges while turning, and none draws over the text.
   - Scrolling down hides the header; scrolling up brings it back.
4. **Open a project**, both by clicking it and by keyboard (Tab to "Open project", then Enter). In the reader:
   - The cover opens to spread 1.
   - Arrow keys, clicking a page and the thumbnails all turn pages.
   - M toggles the magnifier and scrolling changes its power.
   - F flattens the pages.
   - Ctrl/Cmd+scroll and the +/- buttons zoom; dragging pans; 0 resets.
   - Holding a page presses it flat.
   - Esc backs out step by step, then closes.
5. Check a placeholder project with no spreads. It should show the "Coming soon" cover.
6. Check reduced motion with the browser tool's `prefers-reduced-motion` emulation if it has one: no floating, near-instant flip-through. Without a browser tool, skip this check and confirm the `@media (prefers-reduced-motion)` rules and the `reduced` branches in the code still cover your change. Don't ask her to change System Settings.
7. If you can, check a narrow window (below 860px). The magazine should sit above the text with no clipping.
8. The browser console should show no errors or warnings that are new since your change.
9. Take a screenshot and show her what changed. If you changed the shelf, show before and after.

If something breaks, undo your change first, then try a smaller one.

## 6. Usability and taste pass

After it works, run `design-review`'s Quick check on the area you touched. Run the full review (with Impeccable, if installed) only when she asks or before publishing. Tell her the findings in plain words, then use **AskUserQuestion** to ask whether to fix them now, leave them, or adjust differently.

## 7. Wrap up

Explain what changed in 1-2 plain sentences ("The magazines are now about 15% bigger, and the text column is a bit narrower"). Then ask with AskUserQuestion:

- **Keep tweaking (Recommended)**
- **Looks good**: run the full `design-review` on the area. After she picks "Looks good" there, offer **Publish it (Recommended)** and follow `.claude/skills/publish/SKILL.md`.
- **Undo it**
