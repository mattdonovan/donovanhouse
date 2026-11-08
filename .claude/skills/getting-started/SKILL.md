---
name: getting-started
description: Coach Kristin through setup and orientation. Use on first use, or when she says "set me up", "get started", "help", "I'm new", "something's not working", "it's broken", "the preview won't load", "restart the preview", or "help me sign in to GitHub". Checks git, Node, npm packages, the GitHub connection and sign-in, starts the live preview, gives a short tour, and asks what she wants to work on first.
---

# Getting started (coaching Kristin)

Kristin is an interior design student. She is new to AI and to Claude Code, and she is not a developer. Your job is to make this feel like chatting with a helpful studio assistant, not like coding.

## How to talk to her

- Warm, plain English. Short sentences. One step at a time.
- No jargon. If a technical word is needed, explain it in one clause ("Node, the engine that runs the preview").
- Never ask her to edit code or type commands. You run commands. If something can only be done by her (clicking an installer, signing in on a web page), give her one clear step with the exact button names.
- Whenever you need a decision, use the **AskUserQuestion** tool: 2 to 4 short options (never more than 4; header 12 characters or fewer), the recommended option first with "(Recommended)" in its label, one-line descriptions. She can always pick "Other" to type.
- Before running a command, say in one sentence what it does, so the permission prompt she sees makes sense. Example: "I'm going to check whether Node is installed. You'll see a permission box; click to allow it."
- When something fails, don't paste the error. Say what it means and what you'll do next.
- Report progress as a short checklist with checkmarks, not paragraphs.

## Step 0: Make sure we're in the right folder

Run `git rev-parse --show-toplevel` and `git remote get-url origin`.

- If the remote is github.com/mattdonovan/donovanhouse (with or without `.git`, https or `git@` form), continue.
- If this folder is empty or not a git repo, the site hasn't been downloaded yet. Ask (AskUserQuestion) whether to download it here. If yes, run `git clone https://github.com/mattdonovan/donovanhouse .` when the folder is empty, otherwise `git clone https://github.com/mattdonovan/donovanhouse`. Then tell her to start a new chat (Cmd+N, or **+ New** in the sidebar) in the `donovanhouse` folder and say "set me up" again, so Claude can load the site's instructions.
- If `git` itself is missing, go to Step 1 first.

All site commands run in the `site/` folder.

## Step 1: Check the tools

Run these checks quietly, then show one checklist.

| Check | Command | Good result |
|---|---|---|
| Git (saves and shares changes) | `git --version` | any version |
| Node (runs the preview) | `node -v` | v20.19+ or v22.12+ (the live site builds with 22) |
| npm (installs site parts) | `npm -v` | any version |
| Site packages | does `site/node_modules` exist? | yes |
| Up to date | `git status -sb` after `git fetch` | not behind `origin/main` |
| Name on saved changes | `git config user.name` and `git config user.email` | both set |
| GitHub sign-in (for publishing) | `gh auth status` if `gh` exists | logged in |

### Fixing what's missing

**Git missing** (macOS says "no developer tools were found"):
1. Run `xcode-select --install`. This opens a macOS window.
2. Tell her: "A window will pop up asking to install command line developer tools. Click **Install**, then **Agree**. It takes 5 to 15 minutes. Tell me when it says it's done."
3. Use AskUserQuestion: "Done" (Recommended) / "I don't see a window" / "It showed an error". Then re-check.

**Node missing or older than 20.19 (or a 22.x below 22.12):**
1. Tell her: "Go to https://nodejs.org and click the big **LTS** download button. Open the file and click **Continue** through the installer, then **Install**. It may ask for your Mac password."
2. AskUserQuestion: "Installed" (Recommended) / "I'm stuck on a step" / "It showed an error".
3. After she installs, re-run `node -v`. If it still isn't found, the app may need a restart: ask her to quit Claude (Cmd+Q), reopen it, start a new chat in the same folder, and say "set me up".

**Site packages missing:** run `npm install` in `site/`. Say "Installing the site's parts. This takes about a minute."

**Behind GitHub:** follow "Git, one way" in `CLAUDE.md` (`git pull --rebase --autostash`). Only on a real conflict, stop, explain in plain words and offer a note for Matt.

**Name not set:** ask her name and the email on her GitHub account, then run `git config --global user.name "<name>"` and `git config --global user.email "<email>"`. Use AskUserQuestion with "Kristin Donovan" (Recommended) for the name; for the email she'll pick Other and type it.

**GitHub sign-in** (needed only for publishing; skip it if she only wants to explore today, and say so). Matt normally does this with her in person. If `gh auth status` already shows her logged in, skip it. Otherwise ask (AskUserQuestion): "Wait for Matt (Recommended)" / "Try it with me now". Self-serve fallback:
1. Check for the GitHub helper: `command -v gh`. If missing, tell her: "Go to https://cli.github.com and click **Download for Mac**. Open the file and click through the installer." Then ask her to confirm with AskUserQuestion. If `brew` exists, you may run `brew install gh` instead and skip the download.
2. Sign in: run `echo | gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key` in the background (the `echo` answers its "press Enter" prompt) and read its output. It prints a one-time code. Tell her: "A GitHub page will open in your browser. Sign in, then type this code: **XXXX-XXXX**. Click **Authorize**. GitHub may ask you to approve on your phone." If the browser doesn't open, give her https://github.com/login/device.
   - If it still hangs or errors, stop and offer a note for Matt. Don't ask her to type commands.
3. Run `gh auth setup-git` so publishing uses this sign-in.
4. Confirm with `gh auth status` and `git ls-remote origin -h refs/heads/main`.
5. If GitHub says she doesn't have access to the project, she may not have accepted the invitation yet: ask her to look for the GitHub email and click **Accept invitation**. If there's no email, Matt needs to add her as a collaborator; offer a short message she can send him.

## Step 2: Start the preview

1. Run `npm run dev` in `site/` in the background. Wait for the "Local:" line.
2. Tell her: "Your preview is running at **http://localhost:5173**. This is a private copy of the site on your Mac. Changes show up here right away, and nobody else can see them until you publish."
3. Give her the clickable link http://localhost:5173/#/work and say "opens in Safari". (Matt may later document a built-in preview button; use it if `README.md` names one.)
4. Useful pages: `http://localhost:5173/#/work` (projects) and `http://localhost:5173/#/about`.
5. If the port is taken, Vite picks another (5174, ...). Use the address it prints.

## Step 3: The 2-minute tour

Keep this short. Something like:

> Here's how this works:
> - **You talk, I build.** Tell me what you want in your own words, like "make the magazines bigger" or "the About page feels crowded."
> - **You check the preview.** Look at it and tell me what you think. I'll adjust.
> - **Nothing goes live until you say "publish my changes."** Then the real site updates in about 2 minutes.
> - **Mistakes are fine.** Say "undo that" any time. Even published changes can be undone.
>
> Things I'm set up to help with:
> - Adding a new project from a PDF of your presentation
> - Writing or polishing your captions, summaries, and About page
> - Changing how the 3D magazines look, move, and open
> - Giving you an honest design review of any page
> - Publishing to the live site

Mention that the site's rules (colors, fonts, the magazine idea) are in `DESIGN.md`, and that you'll follow them unless she wants to change them.

## Step 4: Ask what she wants to do first

Use AskUserQuestion. Header: "First up". Options:
1. "Add a new project" (Recommended if there are placeholder projects): then follow `.claude/skills/add-project/SKILL.md`.
2. "Write my captions": the DRAFT captions in `site/src/data/projects.js` need her own words. Interview her one spread at a time.
3. "Change how it looks": ask a follow-up AskUserQuestion: magazines, covers, a page layout, or colors and fonts. For magazines, follow `.claude/skills/magazine-3d/SKILL.md`.
4. "Review the design": follow `.claude/skills/design-review/SKILL.md`.

Open items she may want to tackle (from `CLAUDE.md`): six placeholder projects need files (NKBA Standards, Design Flex / 2020, two Chief Architect projects, Environmental Systems, Policies & Procedures); DRAFT captions; the "Why residential?" paragraph and quotes on the About page; a mobile check.

## When she says "something's not working"

1. Ask what she sees, with AskUserQuestion: "The preview is blank or won't load" / "A change looks wrong" / "Publishing failed" / "Something else".
2. Run the Step 1 checks again and fix what's broken.
3. Preview problems: stop any old dev server, run `npm install` in `site/`, start `npm run dev` again, and check the terminal output for errors. Fix the cause, then tell her what happened in one sentence.
4. Publishing problems: go to `.claude/skills/publish/SKILL.md`.
5. If you can't fix it, write a short note she can send to Matt: what she was trying to do, what happened, and the key error line.
