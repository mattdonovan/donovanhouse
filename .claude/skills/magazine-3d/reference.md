# Magazine 3D: knob reference

All paths are relative to `site/src/`. The line numbers were correct when this file was written, but they drift. Always find a knob with `grep -n <NAME>` first. "Safe range" means a range judged safe by reading the code. It has not been tested in a browser for every value.

## Work page (shelf)

| Knob | Where | Now | What it does | Safe range / notes |
|---|---|---|---|---|
| Magazine column width | styles.css:170 `.mag-row` columns | `1fr 1.35fr` | Width of the text column next to the magazine column | 1.1fr-2fr. Raise it to enlarge the magazine |
| Shelf max width | styles.css:165 `.shelf` | 1240px | Caps the size of the whole row | 1100-1600px |
| Gap between rows | styles.css:167 `.shelf` gap | `clamp(3rem,8vw,6rem)` | Vertical space between projects | Mobile row-gap (styles.css:258, 88px) must stay ≥ BLEED_Y |
| Column gap | styles.css:172 | `max(72px,5vw)` | Space between the text and the magazine | Must stay ≥ BLEED_X |
| Stage shape | styles.css:190 `.mag-stage` | `aspect-ratio: 4/3.1` | Card shape the magazine fits into | 4/2.6-4/3.6 |
| Fit margins | Shelf.jsx:29-30 FitCamera | `1.08` (w), `1.1` (h) | Empty margin around the magazine in its card | 1.0-1.3. Below about 1.0 the magazine clips |
| Bleed | Shelf.jsx:13-14 `BLEED_X/Y` | 64 / 80 px | Extra render area so turning pages don't get cut off | Must equal the `.mag-view` inset at styles.css:193 |
| Hero height | styles.css:158 `.work-hero` | `calc(100svh - 70px - 2rem - 170px)` | How much of the first magazine peeks above the fold | Change the `170px` |
| Preview spreads | Shelf.jsx:9 `RIFFLE_SPREADS` | 3 | Spreads flipped on hover before the "Open project" card | 0-6. More spreads mean more textures to load |
| Flip pace | Shelf.jsx:177 `forwardInterval` | 0.85 s (0.04 reduced) | Seconds per page during the hover flip | 0.3-1.5 |
| Hover target | Shelf.jsx:78-81 | `endSpread` | Where the hover flip stops | `1` = just open, `0` = no flip |
| Hover tilt | Shelf.jsx:59-60 `Tilt` | rot `[-0.07,-0.1,0]`, lift `[0,0.03,0.15]`, damp 0.3 | Lean and lift on hover | rotation up to ±0.25, z lift ≤0.4. Must stay `[0,0,0]` at rest |
| Float | Shelf.jsx:163-169 | speed 1.2, floatIntensity 0.25, range ±0.03 | Gentle bobbing | Disabled under reduced motion |
| Gutter curve | Shelf.jsx:179 `curve` | 0.8 | How curved the open pages look | 0 (flat) to 1 |
| Camera | Shelf.jsx:158 | fov 30 | Perspective strength | 20-45. FitCamera adapts |
| Lights | Shelf.jsx:161-162 | ambient 0.4, directional 0.45 | Brightness, together with SELF_LIT | Keep SELF_LIT + lights ≈ 1 |
| Hold vs click | Shelf.jsx:10 `HOLD_MS` | 280 ms | A press longer than this is a "feel" hold, not a click | 200-500. Duplicated in Reader.jsx:14 |
| Hover title color | styles.css:179 | (CSS) | Title color change on row hover | Use brand colors only |
| Hover arrow nudge | styles.css:189 | (CSS) | Arrow movement on hover | |
| Mobile stack | styles.css:257-260 | ≤860px: one column, magazine on top | Small-screen layout | Mobile isn't reviewed yet |

## Page engine (Book.jsx, used by both shelf and reader)

| Knob | Where | Now | What it does | Safe range / notes |
|---|---|---|---|---|
| `PAGE_ASPECT` | :36 | 8/9 | Page shape (half of a 16:9 spread) | Change only if the spread images change shape |
| `PAGE_HEIGHT` | :37 | 1.6 | World size | **Don't use it to resize.** The cameras refit, and the shadow bounds assume this value |
| `PAGE_DEPTH` | :39 | 0.004 | Sheet thickness and stacking | 0.002-0.01 |
| `PAGE_SEGMENTS` | :40 | 30 | Bend resolution | Avoid changing. Many other values count bones |
| `easingFactor` | :44 | 0.5 | How long a page turn takes to settle | 0.2-1.0 (lower is snappier) |
| `easingFactorFold` | :45 | 0.3 | Settling time of the fold wobble | 0.15-0.6 |
| Curve strengths | :46-48 | inside 0.16, outside 0.04, turning 0.09 | Gutter bulge, outer counter-curve, curl while turning | 0-0.25 / 0-0.08 / 0-0.15 |
| Turn duration | :174 | 400 ms (written twice) | Length of the curl during a turn | 250-800. Change both numbers |
| Stack fan | :178 | 0.8° per sheet | How much the open pages fan out | 0-2 |
| Fold angle | :207 | 2° | Fold during a turn | 0-5 |
| Press spring | :51-53 | stiffness 170, damping 15, sigma 7 | Press-to-flatten feel; a slight bounce is intended | Raise damping toward 26 to remove the bounce |
| Book push on press | :344-347 | z -0.045, rotY 0.035, rotX -0.025 | Whole magazine dips when pressed | Up to about 2× |
| `SELF_LIT` | :90 | 0.75 | Pages show their true colors | Keep the total with the lights ≈ 1 |
| Edge colors | :91-93 | paper `#e6e1d8`, spine `#2a2f38` | Page edges | |
| Riffle step | :271 | 0.05 s far / 0.15 s near | Speed when jumping several pages (e.g. thumbnails) | 0.03-0.3 |
| Recenter when closed | :337-338 | damp 0.35 | A closed magazine slides to center | |
| BlobShadow | :283-305 | opacity 0.13, color rgba(20,26,35) | Soft shadow under the shelf magazines | 0.05-0.25. Keep the shadow subtle |
| `MAX_DT` | :54 | 1/30 | Stops springs from going wild after a tab switch | Leave as is |
| Hinge easing | :212-218 | `easing.damp` | Page hinge rotation | Never switch to `dampAngle` |

## Reader (Reader.jsx)

| Knob | Where | Now | What it does | Safe range / notes |
|---|---|---|---|---|
| Zoom limits | :9-10 | 1-6 | Min and max zoom | MAX 3-10 |
| Magnifier | :11-13, :108 | size 280, power 0.4-2.6, start 0.9 | Loupe | Size must match `.loupe` 280px (styles.css:320) |
| Curves | :15-16, :435 | soft 0.45, zoomed 0.2, flat 0 | Page curve in the reader | 0-1. Lower is easier to read |
| Fit margins | :38-39 | 1.06 (w), 1.1 (h) | Book size in the stage | 1.0-1.3 |
| Camera damp | :45-47 | 0.16 | Zoom and pan smoothness | 0.08-0.3 |
| Pan margin | :19-27 `clampPan` | 0.1 | How far you can pan past the edge | |
| Wheel rates | :323-327 | pinch 0.012, wheel 0.0022, loupe 0.0018 | Zoom sensitivity | ±50% |
| Gestures | :277, :294 | 4px moved, swipe >45px in 600ms | Swipe to turn | |
| Auto-open | :361 | 650 ms | Cover opens to spread 1 | 0-1500 |
| Keys | :366-392 `onKey` + :80-89 `SHORTCUTS` | ←/→, M, F, +/-, 0, Esc | Keyboard | Add new keys to **both**. +/- is missing from the legend |
| Canvas and shadows | :466-483 | directional 0.45 at [-0.6,1.2,6], shadow map 2048, catcher plane opacity 0.13 at z -0.12 | Lighting and shadow | Shadow camera ±3 assumes PAGE_HEIGHT 1.6 |
| Float | :484-491 | speed 1, rotationIntensity 0.12, range ±0.02 | Gentle movement; off while zoomed or magnifying | |
| Book tilt | ~:490 | rotation-x -0.05 | Slight lean back | |
| Sidebar width | styles.css:215 | 340px | Captions panel | Stacks below 960px |
| Thumbnails | styles.css:239 | 96px wide | Thumbnail strip | |
| Labels | :62-66 | Cover / Spread i of n / Back cover | Page label | |

## Covers (covers.js)

| Knob | Where | Now | Notes |
|---|---|---|---|
| Colors | :4-6, :194 | NAVY `#1f2b3b`, ORANGE `#f2540b`, PAPER `#f7f4ef`; muted grey `#5d6470` (end card "N spreads inside") | Duplicate the CSS vars (`--navy`, `--orange`, `--paper`, `--muted`) |
| Canvas size | :8-9 | 1024 × 1152 per page | All coordinates are absolute. Use `ctx.scale` if you resize |
| Script scale | :12 | 0.85 | Shrinks the Amsterdam script |
| Front cover | :82-145 | masthead "DONOVAN HOUSE", issue line, photo well, title 76/60px, script name, course | Photo crop is `cover.crop` in data/projects.js. Fallback is "Coming soon" |
| Back cover | :147-166 | navy, "portfolio", script name, email | The email duplicates `contact.email` |
| End card | :170-216 | left: title and info; right: "Open / project →" | Used on the shelf only |
| Fonts | :16-24 `loadFonts` | | Add any new weight here, or the canvas falls back silently |

After any covers.js edit, or a `cover.src` / `cover.crop` change in projects.js, do a **full reload**. The textures are cached by `suspend()` keys in Magazine.jsx:28-30 (the cover key is only the project id).

## Recipes

- **Bigger shelf magazines:** raise `1.35fr` (styles.css:170) and/or `.shelf` max-width, and/or lower the FitCamera margins. If pages clip while turning, raise BLEED_X/Y **and** the `.mag-view` inset together, and keep the column-gap ≥ BLEED_X.
- **Bigger reader magazine:** lower the margins at Reader.jsx:38-39, or narrow the sidebar (styles.css:215).
- **Magazine on the left:** change the grid column order of `.mag-row` (and the markup order in ShelfItem if needed). The column gap rules still apply.
- **No hover flip:** set the hover target to `1` (just opens) or `0` (no flip). Tilt can stay.
- **Remove the "Open project" card:** drop `endCard` (Shelf.jsx:176) and set `endSpread = Math.min(RIFFLE_SPREADS, n)`.
- **Softer or snappier page turns:** `easingFactor`, the turn duration of 400 (both numbers), and the curve strengths.
- **Less bouncy press:** raise PRESS_DAMPING toward 26.
- **New reader shortcut:** add a branch in `onKey` before `else return`, add a row to `SHORTCUTS`, add a `.tool` button in `.stage-tools` if it's a toggle, and update the effect deps.
- **Brand color change:** update the CSS vars, the covers.js constants, the spine edge `#2a2f38` and the blob shadow color in Book.jsx, and the muted grey `#5d6470` at covers.js:194 (copies `--muted`).
- **Reorder projects:** reorder the array in data/projects.js and update the hand-typed `number` strings ("01"…).
