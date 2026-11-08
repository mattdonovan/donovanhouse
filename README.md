# Donovan House: Kristin Donovan's design portfolio

This is Kristin's interior design portfolio website. Each project shows up as a 3D magazine you can flip through, page by page.

- **Live site:** https://mattdonovan.github.io/donovanhouse/
- **This folder on GitHub:** https://github.com/mattdonovan/donovanhouse

Kristin, this guide is for you. You change the site by chatting with Claude in plain English. Claude does the technical work and asks you questions along the way. Most of the time you can answer by clicking a button. You never need to edit code yourself.

---

## First-time setup (about 30-45 minutes, once, mostly waiting for installers)

### 1. Get your GitHub account from Matt
GitHub is where the website's files are stored online. Matt will create your account and sign you in to GitHub on your Mac. You'll approve it on your phone with the GitHub app. GitHub will also email you an invitation to this project: click **Accept invitation**.

### 2. Install the Claude desktop app
1. Go to https://claude.ai/download and click **Download for macOS**.
2. Open the downloaded file and drag Claude into your Applications folder.
3. Open Claude and sign in.

Matt will set your Claude account to the Pro (or Max) plan. Claude Code doesn't work on the free plan. If you don't see a **Code** tab, text Matt.

### 3. Open your Documents folder in Claude Code
1. In the Claude app, click the **Code** tab at the top.
2. Under the message box, make sure **Local** is selected (it means "on this computer").
3. Click the folder button, choose **Open folder…**, and pick **Documents**.

What you'll see: the **Code** tab at the top, a folder name under the message box, and the message box itself where you type.

### 4. Ask Claude to download the website
Copy and paste this message, then press Enter:

> Please run `git clone https://github.com/mattdonovan/donovanhouse` here. It should make a folder called donovanhouse inside Documents. If git isn't installed, tell me what to click. When it's done, tell me to start a new chat.

"Clone" just means "download a copy you can work on." If your Mac asks to install "command line developer tools," click **Install** and wait (5 to 15 minutes). Then ask Claude to try again.

### 5. Start a fresh chat in the new folder and say "set me up"
1. Start a new chat: click **+ New** in the sidebar (or press Cmd+N).
2. Pick the folder **Documents > donovanhouse**. Inside it you should see `README.md`, `CLAUDE.md` and a `site` folder. If you don't, you picked the wrong folder.
3. Type: **set me up**

Claude will check that everything is installed, fix what's missing with your help, show you a live preview of the site, and ask what you want to work on first. Do the same thing any time something seems broken.

### When Claude asks permission

Claude shows a box before it runs something. Here's what to click:

- **Box mentions npm, git status, git pull, or the preview:** click **Allow** (or **Always allow**).
- **Box mentions deleting files, `git push`, or anything outside the donovanhouse folder:** ask "what does this do?" first.
- **Not sure:** click **Deny**. Nothing breaks. Claude will explain.

Your Mac may also ask whether Claude can see your Downloads folder. Click **Allow** so Claude can find your PDFs.

---

## Everyday use

1. Open Claude, click **Code**, and start a new chat in the `donovanhouse` folder.
2. Say what you want, the way you would to a person. You don't need technical words.
3. Look at the preview (Claude gives you a link, http://localhost:5173, that opens in Safari). Say what you like and what you don't.
4. When you're happy, say **publish my changes**.

Changes only go on the live site when you publish. Until then, nothing anyone else sees will change.

### Things you can say (copy and paste)

**Projects and words**
- Add my new kitchen project. I saved the PDF from Canva to Downloads.
- Help me write the captions for the Lowe's bath project.
- Change the summary for the Coastal Style project.
- Move the CAD Kitchen project to the top of the list.
- Update the "Why residential?" paragraph on the About page.

**How it looks**
- Make the magazines bigger on the work page.
- The covers feel too busy. Can you show me a calmer version?
- Make the page turns slower and softer.
- Change what happens when I hover over a magazine.

**Checking and publishing**
- Review the design of the work page.
- Does this look good on a phone?
- Show me what I changed today.
- Publish my changes.
- Undo the last thing I published.

---

## Shortcuts (skills)

A "skill" is a set of instructions Claude follows for a common job. Claude usually picks the right one by itself. You can also type the name with a slash, like `/publish`.

| Type this | What it does |
|---|---|
| `/getting-started` | Checks your setup, fixes problems, starts the preview, and gives you a quick tour. Same as saying "set me up". |
| `/add-project` | Turns a PDF of your presentation into a new magazine and helps you write its title, summary, and captions. |
| `/magazine-3d` | Changes the 3D magazines: size, position, page turns, hover effects, the reader. Claude explains choices in plain words. |
| `/design-review` | Gives you an honest design critique of a page and suggests fixes, like a studio review. |
| `/publish` | Shows what changed in plain words, asks you to confirm, and puts it on the live site. Can also undo a publish. |

---

## Where things live

You don't need to open these files. This map helps when Claude mentions them.

| What | Where |
|---|---|
| Project titles, summaries, tags, captions | `site/src/data/projects.js` |
| Project page images | `site/public/projects/<project-name>/` |
| About page photos | `site/public/about/` |
| Page text and layout (home, about, work) | `site/src/App.jsx` |
| Colors, fonts, spacing | `site/src/styles.css` |
| The 3D magazines | `site/src/components/` |
| Brand and design rules | `DESIGN.md` |
| Instructions Claude reads every time | `CLAUDE.md` |
| Original site plan (older; `DESIGN.md` wins) | `PLAN.md` |
| Your original wireframe and references | `Website wireframe_2026_Donovan Portfolio/` |

---

## If something goes wrong

- **Anything seems broken or confusing:** say "set me up" or "something's not working." Claude will check and walk you through it.
- **The preview page is blank or won't load:** say "restart the preview."
- **A change looks wrong:** say "undo that" or "go back to how it was before."
- **I published something by mistake:** say "undo the last thing I published." This is safe. It adds a new change that reverses the old one.
- **Publishing fails with a password or permission error:** say "help me sign in to GitHub." If that doesn't fix it, ask Matt to check that your account has access.
- **The live site hasn't changed:** it takes 1 to 2 minutes after publishing. Then refresh the page. Hold Shift while clicking refresh if it still looks old.
- **Claude asks permission a lot:** that's normal. It asks before it changes files or runs commands. If you're unsure what something means, ask "what does this do?" before you click.
- **Still stuck:** take a screenshot and send it to Matt.

Please don't share the font files in `site/src/assets/fonts` outside this website. They are paid licenses for this site only.

---

Developer notes (stack, commands, code map) are in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Matt: before Kristin starts

1. **Commit and push the agent files.** `git add CLAUDE.md DESIGN.md CONTRIBUTING.md README.md PLAN.md .claude site/scripts && git commit && git push`. Until then a clone has no coaching, no skills and no PDF converter.
2. **Pre-approve routine commands.** Add `.claude/settings.json` from [CONTRIBUTING.md](CONTRIBUTING.md#permissions) and commit it, so session start doesn't open a string of permission boxes. `git push` stays unapproved so publishing still asks.
3. **GitHub, in person.** Create her account with 2FA through GitHub Mobile. Add her as a collaborator (repo Settings > Collaborators). Have her click **Accept invitation** in the email.
4. **Sign her in on her Mac.** Install `gh` (.pkg from https://cli.github.com), run `gh auth login --web` and `gh auth setup-git`, then check `gh auth status`.
5. **Claude plan.** Pro or Max. Confirm the **Code** tab appears.
6. **Optional head start.** Install Command Line Tools (`xcode-select --install`) and Node 22 LTS from https://nodejs.org.
7. **Impeccable.** At the repo root run `npx impeccable install --providers=claude --scope=project`, review what it adds under `.claude/`, run its init once pointed at `DESIGN.md`, and commit. `design-review` then uses it automatically.
8. **Let Claude see the site.** Install Claude in Chrome and connect it, or confirm the desktop app's preview can take screenshots. Note the real button names and fix them in README, `getting-started` and `design-review`. Add `.claude/launch.json` if the app uses it to start `npm run dev` in `site/`.
9. **Check the permission box wording** against the "When Claude asks permission" section above and match the button labels.
10. **Font licenses.** The licensed font files are committed to this public repo. Check the Pangram Pangram and MyFonts webfont terms allow that, or move them off-repo.
11. **Test it.** Clone into a fresh folder, open it in the Code tab, and say "set me up" once.
