---
name: add-project
description: Add a new project to the portfolio, fill in a "coming soon" placeholder, replace a project's slides, change a cover picture, write or rewrite captions, or reorder projects on the Work page. Use when Kristin says things like "add my new project", "I have a PDF from Canva", "upload my slides", "update the captions", "change the cover", "move this project up", or mentions one of the placeholder projects (NKBA Standards, Design Flex, Chief Architect, Environmental Systems, Policies & Procedures).
---

# Add or update a project

An interview. Kristin answers mostly by clicking. You do all the file work. Follow `CLAUDE.md` for tone: one question at a time, `AskUserQuestion` with 2-4 options and the recommended one first, plain English.

## How projects are stored (for you, not her)

- Everything lives in `site/src/data/projects.js`, in the `projects` array. **Array order is the order on the Work page.**
- Slide images live in `site/public/projects/<id>/`: `spread-01.jpg` (2048 px wide, for the reader) and `spread-01-sm.jpg` (1024 px wide, for the Work page). One 16:9 slide = one open magazine spread.
- A full project entry looks like this:

```js
{
  id: "lowes-primary-bath",              // lowercase-with-dashes, also the folder name and URL (#/work/<id>)
  title: "The Lowe's Primary Bath",      // shown on the Work page and in the reader
  shortTitle: "Lowe's Primary Bath",     // optional, shorter title for the magazine cover (max 2 lines)
  course: "ITMD 235 · Kitchen & Bath",
  term: "Spring 2026",
  number: "01",                          // a string, zero-padded; shown as "No. 01" on cover and list
  cover: { src: asset("projects/lowes-primary-bath/spread-01-sm.jpg"), crop: [0.02, 0, 0.47, 0.6] },
  spreads: spreadUrls("lowes-primary-bath", 12),   // helper at the top of projects.js
  pdf: asset("projects/lowes-primary-bath/lowes-primary-bath.pdf"),  // optional "Original PDF" button
  summary: "One or two sentences.",
  tags: ["Cyncly 2020 Design", "Floor plan + elevation", "Material board", "Renderings"],
  captions: [ { heading: "The concept", body: "…" }, … ],  // one per spread, same order
}
```

- A placeholder looks like `{ id, title, course, term, number, spreads: [], summary: "Project pages coming soon." }`. It shows a "Coming soon" cover.
- Every path to a file in `site/public/` must go through `asset()` (`spreadUrls` does it for you).
- `cover.crop` is `[x, y, width, height]` as fractions (0 to 1) of the cover image. The cover's picture window is about 1.26 times wider than tall, so on a 16:9 slide a crop with `width ≈ 0.7 × height` fills it without extra trimming.
- Captions starting with `DRAFT —` are placeholders for her own words.

## Flow: add a new project

### 1. What does she have?

Ask with `AskUserQuestion` (header: "Your files"):
- **A PDF from Canva** (Recommended) — "Exported as a PDF. Each slide becomes a magazine spread."
- **Slide images** — "JPG or PNG files, one per slide."
- **Nothing yet** — "Add it as 'coming soon' and fill it in later."

If she has nothing yet, skip to step 3, then add a placeholder entry and finish.

If she needs to export from Canva, tell her: Share → Download → File type "PDF Standard" → Download. Slides should be 16:9 (Canva's "Presentation" size).

### 2. Get the file

1. Tell her: "Save the PDF from Canva. It goes to your Downloads folder. Then I'll list your newest PDFs and you click the right one. Your Mac may ask whether Claude can see your Downloads folder. Click **Allow**."
2. Run `ls -t ~/Downloads/*.pdf | head -4` and offer the results as AskUserQuestion options (file name plus date in the description, newest first as Recommended).
3. If she attaches a file to the chat instead, you may not get a path on disk. Ask her to save it to Downloads and go back to step 2.

Check the file: page count, and that the pages are 16:9 (about 1.78 wide to 1 tall). If not 16:9, explain that the pages would look squashed and ask whether to re-export from Canva in Presentation size or add white bars to fit (Recommended only if re-exporting is a hassle).

### 3. The basics

Ask these one at a time. Where possible, read the slides first (look at `spread-01-sm.jpg` after step 4, or the PDF) and offer drafts as options.

1. **Title** — offer 2-3 options taken from the title slide; she can pick "Other" to type.
2. **Course** — offer courses already used in `projects.js`, plus "Other". Format: `"CODE 123 · Course Name"` when there is a course code.
3. **Term** — offer the last few terms ("Fall 2026", "Spring 2026", "Fall 2025") plus "Other".
4. **Short cover title** — only if the title is longer than about 20 characters. Offer a shortened version.
5. **Summary** — draft 2-3 one-to-two-sentence summaries from the slides in her voice (warm, specific, design-focused, no hype). Let her pick, then offer small tweaks.
6. **Tags** — offer a `multiSelect` question with 4 likely tags (software used, drawing types, "Material board", "Renderings"), then ask if anything is missing.

Make the `id` from the short title: lowercase, words joined by dashes, no apostrophes (e.g. `smith-kitchen-remodel`). Make sure no other project uses it. Don't ask her about the id.

### 4. Make the slide images

From `site/`:

- **PDF**: `swift scripts/pdf-to-spreads.swift "<path to pdf>" public/projects/<id>`
  The first run can take a minute while macOS compiles the script. If `swift` is missing, macOS will offer to install the Command Line Tools; tell her to click Install and wait.
- **Images**: for each slide in order, `sips -s format jpeg -s formatOptions 85 --resampleWidth 2048 "<in>" --out public/projects/<id>/spread-NN.jpg` and the same with `--resampleWidth 1024` to `spread-NN-sm.jpg`. Number them `01`, `02`, … in the order she wants (ask if the file names don't make the order obvious).

Check the folder has a `spread-NN.jpg` and `spread-NN-sm.jpg` for every slide.

**Original PDF button (optional).** Ask whether to include a "View original PDF" button. Remind her the repo is public, so the PDF will be downloadable by anyone. If yes, copy it to `public/projects/<id>/<id>.pdf`. If it is over about 25 MB, say it will slow down publishing and suggest skipping it or exporting a smaller PDF from Canva.

### 5. Pick the cover picture

Look at the small slide images. Pick 3 strong candidates for the cover (a hero rendering, the material board, a striking detail). Ask with `AskUserQuestion` (header: "Cover"), describing each in design terms ("The shower rendering from slide 11, cropped to the glass and marble"). Use `preview` on the options if available to show the crop.

Set `cover.src` to that slide's `-sm.jpg` and choose a `crop` that frames the subject (`width ≈ 0.7 × height`). After she sees it in the preview, offer: "Looks good" / "Zoom in closer" / "Show more of the room" / "Try a different picture".

After changing `cover.src` or `cover.crop`, do a full page reload of the preview (Cmd+R). The cover is cached by project id, so hot reload keeps showing the old crop.

### 6. Add the entry

- Insert it in `projects.js` where she wants it. Ask: "At the top (newest first)" (Recommended) / "After the finished projects" / "At the end". If the order changes, renumber every project's `number` so they run `"01"`, `"02"`, … top to bottom.
- Otherwise give it the next number.
- Use `spreadUrls("<id>", <count>)` for `spreads`.
- Add `captions` with one entry per spread; fill them in step 7. Start each body with `DRAFT — ` until she approves it.

### 7. Captions, spread by spread

Captions are the design-reasoning panel next to each spread in the reader. Go through the spreads in order:

1. Look at the spread image. Tell her which one you're on ("Spread 3 of 12: the floor plan").
2. Offer 2-3 draft captions with `AskUserQuestion`: a short heading (2-4 words) plus 1-3 sentences explaining the **design choice and why**, not just what's on the slide. Vary them (one about function, one about materials/feel, one about the client's needs).
3. Options include "Write my own" (she types it) and "Skip for now" (keep it marked `DRAFT —`).
4. When she picks or writes one, save it without the `DRAFT — ` prefix.

After every 4 spreads, offer: "Keep going" (Recommended) / "Finish the rest later" / "Preview what we have".

For a title-only or thank-you slide, offer a short heading and one line rather than a full paragraph.

### 8. Preview and review

1. Make sure the dev server is running (`npm run dev` in `site/`). Send her to http://localhost:5173/#/work and tell her where the new project is. Then http://localhost:5173/#/work/<id> to open it.
2. Ask her to hover over the magazine and click through a few spreads.
3. Run `npm run build` to check nothing is broken.
4. Run the `design-review` skill on the Work page row and the reader for this project.
5. Ask: "Publish it now" (Recommended) / "Keep editing" / "Save it for later". If publish, use the `publish` skill.

## Flow: fill in a placeholder

Same as above, but keep the existing `id` and `number`, and replace the placeholder entry in place (don't add a second one). Ask first whether the title, course and term on the placeholder are still right (offer "Yes, keep them" as Recommended).

## Flow: replace a project's slides

1. Confirm which project and why (new export, fixed a typo, added slides).
2. Ask before deleting the old images. Then remove the old `spread-*.jpg` files in that folder and generate the new ones.
3. If the slide count changed, update the count in `spreadUrls`, and line up the captions: show her which spreads gained or lost captions and ask before dropping any.
4. Check `cover.src` still points to a file that exists and still shows the right picture.

## Flow: edit captions only

Ask which project (options from `projects.js`, projects with `DRAFT —` captions first). Then run step 7 for the spreads she picks (offer "Only the DRAFT ones" as Recommended).

## Flow: reorder projects

1. Show the current order as a numbered list (number, title, term).
2. Ask which project to move and where, with options. Repeat until she's happy.
3. Reorder the array and renumber every `number` so they run `"01"`, `"02"`, … top to bottom. The number shows on covers, the list and the "Open project" card.
4. Preview at http://localhost:5173/#/work, then offer to publish.

## Checks before you finish

- Every new image path uses `asset()` or `spreadUrls`.
- `captions.length` equals the number of spreads.
- No two projects share an `id` or `number`.
- `npm run build` passes.
- If she shared anything personal or a real client's name or address, you warned her the repo is public.
