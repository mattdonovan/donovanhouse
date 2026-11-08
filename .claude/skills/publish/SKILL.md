---
name: publish
description: Publish Kristin's changes to the live website, or undo a published change. Use when she says "publish", "publish my changes", "make it live", "put it on the site", "push", "save to GitHub", "update the live site", "what did I change", "undo the last thing I published", or "take that back off the site".
---

# Publish to the live site

The live site is https://mattdonovan.github.io/donovanhouse/. Every push to `main` triggers `.github/workflows/deploy.yml`, which builds `site/` and deploys to GitHub Pages in about 1 to 2 minutes.

Kristin is not a developer. Talk in plain English, short sentences. Never show raw diffs or git output unless she asks. Use the **AskUserQuestion** tool for every decision (2 to 4 options, recommended first with "(Recommended)" in the label). Say in one sentence what each command does before running it, so the permission prompt makes sense.

## Hard rules

- Never force push (`--force`, `--force-with-lease`). Never `git reset --hard`, `git rebase -i`, or rewrite commits already on `origin/main`. `git pull --rebase` of her unpublished commits is fine.
- Never commit secrets, `node_modules/`, `dist/`, or `.DS_Store`.
- Never publish if the build fails.
- If GitHub has newer changes that conflict with hers, stop. Explain in plain words and offer to write a note to Matt. Don't guess at conflict fixes in content you don't understand.

## Publish flow

### 1. See what changed
Run `git status --porcelain` and `git diff --stat` (plus `git diff` for your own understanding). Also check `git log origin/main..HEAD --oneline` for changes saved but not yet published.

If there's nothing to publish, say so and stop.

### 2. Describe it in her words
Write a short bullet list of what changed, from a visitor's point of view. Examples:
- "Added the Kitchen Remodel project with 8 spreads."
- "Made the magazines on the Work page about 15% bigger."
- "Rewrote the captions for spreads 3 to 5 of the Lowe's bath."

Point out anything that looks unintended: stray files, large files over 10 MB, files outside `site/`, or `DRAFT` captions going live. Ask about each before including it.

### 3. Ask for confirmation
AskUserQuestion, header "Publish?":
1. "Publish it" (Recommended)
2. "Let me look at the preview first": remind her of http://localhost:5173 and wait.
3. "Leave something out": ask which item, then leave those files unstaged.
4. "Not yet": stop. Her changes stay safe on her Mac.

### 4. Check that it builds
Run `npm run build` in `site/`. This is the same check GitHub runs.

If it fails: don't publish. Tell her in one or two sentences what broke ("A file name in the new project doesn't match its images"). Fix it if the cause is clear, show her the preview, and ask again. If you can't fix it, offer to write a note to Matt.

### 5. Get the latest from GitHub
Follow "Git, one way" in `CLAUDE.md`: `git pull --rebase --autostash`. If there's a real conflict: `git rebase --abort`, explain in plain words, and stop.

### 6. Save with a clear message
Stage only the files she approved (`git add <paths>`, not `git add -A` if anything was excluded). Commit with a short, plain message that describes the change, for example `Add Kitchen Remodel project` or `Make work page magazines larger`. Add a body line if there are several changes.

If `git config user.name` or `user.email` is empty, run the name step in `.claude/skills/getting-started/SKILL.md` first.

### 7. Send it to GitHub
Run `git push origin main`.

If it fails with an authentication or permission error, run the GitHub sign-in steps from `.claude/skills/getting-started/SKILL.md`, then push again. If GitHub says she has no access, Matt needs to add her as a collaborator. Her change is saved locally and will publish once that's fixed; tell her so.

### 8. Watch the deploy
Tell her: "Sent. GitHub is now building the live site. This takes 1 to 2 minutes."

- If `gh` is available and signed in: find the run with `gh run list --workflow deploy.yml --branch main --limit 1`, then `gh run watch <id> --exit-status`. Report done or failed in one line.
- Otherwise: tell her she can watch progress at https://github.com/mattdonovan/donovanhouse/actions. A green check means it's live; a red X means it failed.

If the deploy fails, read the log (`gh run view <id> --log-failed`), explain in plain words, fix, and publish again.

### 9. Share the link
"It's live: https://mattdonovan.github.io/donovanhouse/". Link straight to the changed page when it's clear, such as `https://mattdonovan.github.io/donovanhouse/#/work` or `#/work/<project-id>`. Mention that if it looks old, hold Shift and click refresh.

## Undo a published change

Use this when she says "undo the last thing I published" or similar. Undo by adding a new change that reverses the old one (`git revert`). Never use `git reset` on `main`, and never force push.

1. Run `git pull --rebase --autostash`, then `git log --oneline -10`.
2. Describe the recent published changes in plain words. Use AskUserQuestion to ask which one to undo, with the most recent first (Recommended). Include "Never mind" as an option.
3. Confirm what will go back to how it was, in one or two bullets.
4. Run `git revert --no-edit <commit>`. For a merge commit, add `-m 1`. If the revert conflicts, run `git revert --abort`, explain, and offer a note to Matt.
5. Run `npm run build` in `site/` to make sure it still builds.
6. Run `git push origin main`, then follow steps 8 and 9 above.

Unpublished changes: "undo that" means reverse only your most recent edit, by editing it back (see "Git, one way" in `CLAUDE.md`). Use `git restore <path>` only if she picks "Throw away everything since I last published" from an AskUserQuestion that names what will be lost.
