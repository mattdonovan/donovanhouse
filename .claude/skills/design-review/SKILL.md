---
name: design-review
description: Taste and usability check for Kristin's portfolio site. Use when Kristin asks "review the design", "does this look good?", "is this on-brand?", "what would make this better?", "check the layout", "critique", "polish", or after any visual change (colors, fonts, spacing, layout, the 3D magazines, hover or reader behavior) before offering to publish. Compares the site against DESIGN.md and a checklist, explains findings in plain words, and lets her pick fixes by clicking.
---

# Design review

Kristin is a design student, not a developer. She has a great eye for interiors but may not know web terms. Your job here is to be her second pair of eyes: look at the site, judge it against `DESIGN.md`, and explain what you see the way a friendly design instructor would. No code in your report. She picks what to fix by clicking.

## When to run

- She asks for a review, a critique, or "does this look good?"
- Automatically, in a light form, after you make a visual change for her (see "Quick check" below).
- Before the `publish` skill pushes a visual change, if no review has happened yet this session.

## Step 1: Agree on scope

Unless she already said what to look at, ask with **AskUserQuestion** (one question, clickable options, recommended first):

- "What should I look at?"
  - **The page we just changed (Recommended)**
  - The whole site
  - The project list and magazines
  - The magazine reader

## Step 2: See the site

1. Make sure the dev server is running. In `site/`: `npm install` if `node_modules/` is missing, then `npm run dev`. The site is at http://localhost:5173.
2. Look at it for real. Use a browser tool (Claude in Chrome, or the desktop app's preview if it can take screenshots) to open pages and take screenshots.
3. Visit the routes in scope: `#/`, `#/about`, `#/work`, and one project like `#/work/lowes-primary-bath`.
4. On `#/work`, hover a project row and wait about 4 seconds to see the flip-through land on "Open project". Open a project and try **M** (magnify), **F** (flatten), zoom (+ / −), and the thumbnails.
5. Check at two widths: a laptop (about 1440 × 900) and a phone (about 390 × 844). Mobile is not reviewed yet, so phone findings are "notes for later" unless something is broken.
6. **No browser tool?** Coach her to show you, one screenshot at a time. For example: "Open http://localhost:5173/#/work (opens in Safari). Hover over the second magazine for 4 seconds. Press Cmd+Shift+4, drag a box around the magazine, then drag the screenshot from your desktop into this chat." Ask with AskUserQuestion: "Done (Recommended)" / "I'm stuck". Ask for 2-3 screenshots at most.
7. Only if neither works, review from the code (`site/src/styles.css`, `site/src/App.jsx`, `site/src/components/`) and say clearly which findings you saw and which you inferred.

## Step 3: Judge it

Read `DESIGN.md` first. Then go through this checklist. Only report real problems or clear wins; skip anything that's fine.

| Area | Ask yourself |
|---|---|
| **Hierarchy** | Is it obvious what to look at first, second, third? Does the work stay the hero? |
| **Legibility** | Can you read every caption, summary and label easily? Text near the magazine fold readable? |
| **Contrast** | Small text in `--ink` or `--muted`, not orange. Buttons readable. White on orange is about 3.5:1. That only passes for large text (≥24px, or ≥18.66px at weight 700). The orange Connect buttons (16px/600 and 14.4px) fall short: mention it as a known tradeoff, don't bless it |
| **Spacing rhythm** | Do gaps repeat consistently? Anything cramped or floating alone? |
| **Alignment** | Do edges line up (text column, magazine, header padding)? |
| **Consistency** | Navy/orange/paper used per `DESIGN.md`? Same button styles, same title styles, same wording ("projects", never "issues")? |
| **Brand fonts** | PP Object Sans for headings, Amsterdam script only in orange accents, Montserrat for body. Script letters connected (letter-spacing normal)? Both hero wordmarks the same size? |
| **Motion restraint** | Does anything move more than it needs to? Does motion ever get in the way of reading? |
| **Discoverability** | Would a first-time visitor know they can hover a magazine, click to open, magnify, flatten and zoom? Is "Open project" clear? |
| **Keyboard and reduced motion** | Can you Tab to every link and button, with the orange focus ring showing? Does focusing a project row trigger the flip? With reduced motion on, do float and flip-through calm down? |
| **Placeholder states** | "Coming soon" covers, `DRAFT` captions, About placeholders: do they look intentional or broken? Are any `DRAFT` labels about to go public? |
| **Mobile sanity** | Nothing overlapping, cut off or unreachable at phone width |
| **Privacy** | No phone numbers or client last names visible in images or captions (the repo and site are public) |

## Step 4: Report in plain words

Rank findings by how much they'd affect a hiring manager's first impression. Keep it to the **top 3–6**. For each:

- **What:** one sentence, in everyday words. ("The project summaries are light grey and a bit small, so they're hard to read.")
- **Why it matters:** one sentence.
- **Before → after:** what it looks like now and what you'd change it to, in visual terms. ("Grey 16px text → slightly darker grey at 17px.")
- **Effort:** quick / medium / bigger.

Mention 1–2 things that are working well, briefly. Don't use jargon; if you must, explain it in a few words.

## Step 5: Let her choose

Ask with **AskUserQuestion**, `multiSelect: true`, up to 4 options (the top findings, labelled in a few words). She can pick several or type something else via "Other". Then:

1. Make the chosen changes. For anything in the 3D magazines, follow `.claude/skills/magazine-3d/SKILL.md`.
2. Keep every rule in `DESIGN.md`. If her choice goes against a rule, say so in one line and ask (AskUserQuestion: **Keep the current rule (Recommended)** / Change the rule for this) before doing it.
3. Show her the result (refresh the preview or screenshot again).
4. If she made a new design decision, add a row to the Decisions log in `DESIGN.md`.
5. Offer to publish with the `publish` skill. Don't push without her saying yes.

## Quick check (after your own visual edits)

After you change anything visual, look at the changed page once and run the checklist silently. If something is off, fix it before showing her, or mention it in one line. Don't run the full interview unless she asks.

## Impeccable (the default design brain)

[Impeccable](https://impeccable.style) (Apache-2.0) is a design-quality skill Matt installs in this repo at `.claude/skills/impeccable/`. When that folder exists, use it in every full review. Invoke it yourself through the **Skill** tool; she never sees or types the command names.

If the folder is missing, use the checklist above on its own and don't offer to install anything. Mention once, in one line, that Matt can add it (see the checklist in `README.md`). Never turn on Impeccable's hooks for her.

| Situation | Impeccable action |
|---|---|
| Full review | `critique <page or area>`, then `audit <page or area>` |
| After she picks fixes | `polish <the changed area>` |
| "It feels too busy / too plain" | `quieter …` or `bolder …` |
| Type looks off | `typeset …` |
| Layout or spacing looks off | `layout …` |

Rules:
- Impeccable's suggestions are input, not orders. `DESIGN.md` wins. Drop anything that breaks the brand colors, fonts, wordmark rules, white background, "projects" wording, or "legibility over 3D flair".
- Never let it change the 3D page-turn code without going through `.claude/skills/magazine-3d/SKILL.md`.
- Merge its findings into your Step 4 report. Don't paste its raw output at her.
